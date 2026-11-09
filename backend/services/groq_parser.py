import os
import json
import logging
import re
from typing import Dict, Any, Optional

from backend.core.config import settings
from backend.core.logging import logger
from backend.services.skill_extractor import skill_extractor

GROQ_MODEL = settings.GROQ_MODEL or 'llama-3.3-70b-versatile'

RESUME_SYSTEM_PROMPT = (
    "You are a resume parser. Extract information from the resume "
    "and return ONLY a valid JSON object. No explanation, no markdown."
)

RESUME_USER_PROMPT = """Extract the following from this resume and return as JSON:
{{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "linkedin": "LinkedIn URL if present, otherwise null",
  "github": "GitHub URL if present, otherwise null",
  "professional_summary": "the full text of the Summary, Profile, About Me, Objective, or Professional Summary section at the top of the resume. Copy the ENTIRE paragraph exactly as written. If no such section exists, return an empty string.",
  "skills": ["list", "of", "skills"],
  "experience": [
    {{
      "job_title": "",
      "company": "",
      "start_date": "",
      "end_date": "",
      "duration_months": 0,
      "description": ""
    }}
  ],
  "education": [
    {{
      "degree": "",
      "institution": "",
      "year": ""
    }}
  ],
  "certifications": ["list of certifications"],
  "projects": [
    {{
      "title": "project name",
      "description": "what the project does and how it was built",
      "technologies": ["tech", "used"]
    }}
  ],
  "action_verbs": ["strong action verbs used in bullet points, e.g. developed, implemented, designed"],
  "keywords": ["important keywords and phrases from the resume for ATS matching"]
}}

Important instructions:
- For duration_months, calculate the number of months between start_date and end_date. If end_date is "Present" or "Current", calculate from start_date to now.
- For skills, extract ALL technical and soft skills mentioned anywhere in the resume.
- For action_verbs, find verbs that start bullet points or describe achievements.
- For keywords, extract noun phrases and technical terms relevant to ATS matching.
- Return ONLY valid JSON. No markdown code fences, no explanation.

Resume Text:
{raw_text}"""

JD_SYSTEM_PROMPT = (
    "You are a job description parser. Extract information and "
    "return ONLY a valid JSON object. No explanation, no markdown."
)

JD_USER_PROMPT = """Extract the following from this job description and return as JSON:
{{
  "job_title": "",
  "required_skills": ["list of must-have skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "experience_required": "",
  "education_required": "",
  "key_responsibilities": ["list of responsibilities"],
  "keywords": ["important keywords and phrases for ATS matching"]
}}

Important instructions:
- required_skills: skills explicitly stated as required or must-have.
- preferred_skills: skills stated as preferred, nice-to-have, or bonus.
- keywords: extract ALL important terms an ATS system would match against,
  including skills, technologies, certifications, and domain terms.
- Return ONLY valid JSON. No markdown code fences, no explanation.

Job Description Text:
{raw_text}"""

def _try_parse_json(text: str) -> Optional[dict]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        first_newline = cleaned.index("\n") if "\n" in cleaned else len(cleaned)
        cleaned = cleaned[first_newline + 1:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None

def _fallback_parse_resume(raw_text: str) -> Dict[str, Any]:
    from backend.services.resume_parser import segment_sections
    sections = segment_sections(raw_text)

    skills_info = skill_extractor.extract_skills_from_text(raw_text)
    email_m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    phone_m = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
    linkedin_m = re.search(r'https?://(?:www\.)?linkedin\.com/in/[\w-]+', raw_text, re.I)
    github_m = re.search(r'https?://(?:www\.)?github\.com/[\w-]+', raw_text, re.I)

    # Parse projects
    projects = []
    proj_content = sections.get('projects', '')
    if proj_content:
        proj_lines = proj_content.split('\n')
        curr_proj = None
        for pline in proj_lines:
            pline_str = pline.strip()
            if not pline_str:
                continue
            if pline_str.startswith(('*', '-', '•')):
                if curr_proj:
                    curr_proj['description'] += ' ' + pline_str.lstrip('*-• ').strip()
            elif len(pline_str) < 60:
                if curr_proj:
                    projects.append(curr_proj)
                proj_skills = skill_extractor.extract_skills_from_text(pline_str)["skills"]
                curr_proj = {
                    "title": pline_str,
                    "description": pline_str,
                    "technologies": proj_skills
                }
            else:
                if curr_proj:
                    curr_proj['description'] += ' ' + pline_str
        if curr_proj:
            projects.append(curr_proj)

    for p in projects:
        found_techs = skill_extractor.extract_skills_from_text(p['description'])["skills"]
        p['technologies'] = list(set(p.get('technologies', []) + found_techs))

    # Parse experience
    experience = []
    exp_content = sections.get('experience', '')
    if exp_content:
        exp_lines = exp_content.split('\n')
        curr_exp = None
        for eline in exp_lines:
            eline_str = eline.strip()
            if not eline_str:
                continue
            if any(v in eline_str.lower() for v in ['engineer', 'developer', 'analyst', 'manager', 'lead', 'architect', 'consultant']) and len(eline_str) < 80:
                if curr_exp:
                    experience.append(curr_exp)
                curr_exp = {
                    "job_title": eline_str,
                    "company": "Company",
                    "start_date": "",
                    "end_date": "",
                    "duration_months": 24,
                    "description": eline_str
                }
            elif curr_exp:
                curr_exp['description'] += ' ' + eline_str
        if curr_exp:
            experience.append(curr_exp)
    else:
        for line in raw_text.split('\n'):
            if any(v in line.lower() for v in ['engineer', 'developer', 'analyst', 'manager']) and len(line) < 80:
                experience.append({
                    "job_title": line.strip(),
                    "company": "Company",
                    "start_date": "",
                    "end_date": "",
                    "duration_months": 12,
                    "description": line.strip()
                })

    lines = raw_text.split('\n')
    return {
        "name": lines[0].strip() if lines else "Candidate",
        "email": email_m.group(0) if email_m else None,
        "phone": phone_m.group(0) if phone_m else None,
        "linkedin": linkedin_m.group(0) if linkedin_m else None,
        "github": github_m.group(0) if github_m else None,
        "professional_summary": sections.get('summary', ''),
        "skills": skills_info["skills"],
        "experience": experience,
        "education": [{"degree": "Degree", "institution": "University", "year": ""}] if sections.get('education') else [],
        "certifications": [],
        "projects": projects,
        "action_verbs": [w for w in ['developed', 'implemented', 'designed', 'optimized', 'architected', 'spearheaded', 'built', 'created'] if w in raw_text.lower()],
        "keywords": skills_info["skills"]
    }

def parse_resume(raw_text: str) -> Dict[str, Any]:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return _fallback_parse_resume(raw_text)

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        prompt = RESUME_USER_PROMPT.format(raw_text=raw_text[:4000])
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {'role': 'system', 'content': RESUME_SYSTEM_PROMPT},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.0,
            max_tokens=4096
        )
        content = response.choices[0].message.content.strip()
        result = _try_parse_json(content)
        if result is not None:
            return _validate_resume_result(result)
        return _fallback_parse_resume(raw_text)
    except Exception as e:
        logger.warning(f"Groq parse_resume failed: {e}. Using fallback parser.")
        return _fallback_parse_resume(raw_text)

def parse_job_description(raw_text: str) -> Dict[str, Any]:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        skills = skill_extractor.extract_skills_from_text(raw_text)["skills"]
        return {
            "job_title": "Target Role",
            "required_skills": skills[:10],
            "preferred_skills": skills[10:],
            "experience_required": "",
            "education_required": "",
            "key_responsibilities": [],
            "keywords": skills
        }

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        prompt = JD_USER_PROMPT.format(raw_text=raw_text[:4000])
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {'role': 'system', 'content': JD_SYSTEM_PROMPT},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.0,
            max_tokens=4096
        )
        content = response.choices[0].message.content.strip()
        result = _try_parse_json(content)
        if result is not None:
            return _validate_jd_result(result)
    except Exception as e:
        logger.warning(f"Groq parse_job_description failed: {e}. Using fallback.")

    skills = skill_extractor.extract_skills_from_text(raw_text)["skills"]
    return {
        "job_title": "Target Role",
        "required_skills": skills[:10],
        "preferred_skills": skills[10:],
        "experience_required": "",
        "education_required": "",
        "key_responsibilities": [],
        "keywords": skills
    }

def _validate_jd_result(result: dict) -> dict:
    defaults = {
        "job_title": "",
        "required_skills": [],
        "preferred_skills": [],
        "experience_required": "",
        "education_required": "",
        "key_responsibilities": [],
        "keywords": [],
    }
    for key, default in defaults.items():
        if key not in result or result[key] is None:
            result[key] = default
        if isinstance(default, list) and not isinstance(result[key], list):
            result[key] = default
    return result

def _validate_resume_result(result: dict) -> dict:
    defaults = {
        "name": "",
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
        "professional_summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "projects": [],
        "action_verbs": [],
        "keywords": [],
    }
    for key, default in defaults.items():
        if key not in result or result[key] is None:
            result[key] = default
        if isinstance(default, list) and not isinstance(result[key], list):
            result[key] = default

    for exp in result.get("experience", []):
        if not isinstance(exp, dict):
            continue
        exp.setdefault("job_title", "")
        exp.setdefault("company", "")
        exp.setdefault("start_date", "")
        exp.setdefault("end_date", "")
        exp.setdefault("duration_months", 0)
        exp.setdefault("description", "")
        try:
            exp["duration_months"] = int(exp["duration_months"])
        except (ValueError, TypeError):
            exp["duration_months"] = 0

    for proj in result.get("projects", []):
        if not isinstance(proj, dict):
            continue
        proj.setdefault("title", "")
        proj.setdefault("description", "")
        proj.setdefault("technologies", [])

    return result
