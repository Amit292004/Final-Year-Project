import json
import httpx
from typing import Dict, Any, List, Optional
from backend.core.config import settings
from backend.core.logging import logger
from backend.schemas.assessment import BulletRewrite

class FeedbackEngine:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_llm_feedback(
        self,
        resume_text: str,
        target_role: str = "Software Engineer",
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls Groq API with structured JSON schema prompt.
        If Groq is not configured or fails, falls back gracefully to rule-based generator.
        """
        if not self.api_key:
            logger.info("GROQ_API_KEY not configured. Using deterministic rule-based feedback engine.")
            return self._fallback_feedback(resume_text, target_role, job_description)

        system_prompt = (
            "You are a premier technical recruiter and career coach. "
            "Analyze the candidate's resume against their target role. "
            "Return ONLY valid JSON matching this schema:\n"
            "{\n"
            '  "executive_summary": "string",\n'
            '  "key_strengths": ["string"],\n'
            '  "critical_issues": ["string"],\n'
            '  "missing_keywords": ["string"],\n'
            '  "bullet_point_rewrites": [\n'
            '    {\n'
            '      "original": "string",\n'
            '      "improved": "string",\n'
            '      "reason": "string",\n'
            '      "requires_confirmation": true\n'
            '    }\n'
            '  ]\n'
            "}\n"
            "IMPORTANT: When rewriting bullets, use Google's X-Y-Z format: 'Accomplished [X] as measured by [Y], by doing [Z]'. "
            "DO NOT invent false employers or factual certifications. If adding a quantitative metric placeholder, set requires_confirmation to true."
        )

        user_content = f"Target Role: {target_role}\n"
        if job_description:
            user_content += f"Job Description:\n{job_description[:1500]}\n"
        user_content += f"Resume Content:\n{resume_text[:3500]}"

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content}
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return {
                        "executive_summary": parsed.get("executive_summary", ""),
                        "key_strengths": parsed.get("key_strengths", []),
                        "critical_issues": parsed.get("critical_issues", []),
                        "missing_keywords": parsed.get("missing_keywords", []),
                        "bullet_point_rewrites": parsed.get("bullet_point_rewrites", []),
                        "provider": "groq",
                        "model": self.model
                    }
                else:
                    logger.warning(f"Groq API returned HTTP {response.status_code}: {response.text}")
                    return self._fallback_feedback(resume_text, target_role, job_description)
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}. Falling back to rule-based engine.")
            return self._fallback_feedback(resume_text, target_role, job_description)

    def _fallback_feedback(
        self,
        resume_text: str,
        target_role: str,
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Deterministic, rule-based feedback generator for offline/unconfigured LLM environments.
        """
        lines = [l.strip().lstrip('•-* ') for l in resume_text.split('\n') if len(l.strip()) > 30]
        sample_bullets = lines[:3]

        rewrites = []
        for bullet in sample_bullets:
            rewrites.append({
                "original": bullet,
                "improved": f"Engineered and deployed {bullet.lower().rstrip('.')}, achieving a 30% reduction in processing latency by adopting asynchronous architectural patterns.",
                "reason": "Restructured with Google's X-Y-Z formula: strong action verb, precise technical deliverable, and measurable operational outcome.",
                "requires_confirmation": True
            })

        return {
            "executive_summary": f"Your background shows solid foundational readiness for a {target_role} role. Focusing on quantifiable project outcomes and deeper keyword alignment will enhance ATS discoverability.",
            "key_strengths": [
                "Clear technical terminology and recognizable toolchain references.",
                "Structured section layout enabling automated parser readability.",
                "Evidence of practical hands-on software development experience."
            ],
            "critical_issues": [
                "Several bullet points lack quantifiable business metrics or performance KPIs.",
                "Experience descriptions focus on assigned tasks rather than proactive engineering impact."
            ],
            "missing_keywords": ["CI/CD Pipelines", "System Architecture", "Automated Testing", "Cloud Deployment"],
            "bullet_point_rewrites": rewrites,
            "provider": "deterministic_rules",
            "model": "rule_based_fallback"
        }

feedback_engine = FeedbackEngine()
