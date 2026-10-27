import re
import io
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from docx import Document
from backend.schemas.resume import (
    ParsedResume, ContactInfo, ExperienceEntry, EducationEntry, ProjectEntry, CertificationEntry
)
from backend.core.logging import logger

EMAIL_REGEX = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
LINKEDIN_REGEX = re.compile(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)')
GITHUB_REGEX = re.compile(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)')
STREET_ADDRESS_REGEX = re.compile(r'\b\d{1,5}\s+[a-zA-Z0-9\.\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Apt|Suite|Unit|Terrace|Ter|Way|Place|Pl|Circle|Cir)\b', re.IGNORECASE)
POSTAL_CODE_REGEX = re.compile(r'\b\d{5}(-\d{4})?\b|\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b')

SECTION_PATTERNS = {
    'summary': re.compile(r'^(professional\s+summary|summary|profile|about\s+me|objective)(\s*[:\-])?$', re.IGNORECASE),
    'skills': re.compile(r'^(technical\s+skills|skills|core\s+competencies|technologies|tools)(\s*[:\-])?$', re.IGNORECASE),
    'experience': re.compile(r'^(work\s+experience|professional\s+experience|experience|employment\s+history)(\s*[:\-])?$', re.IGNORECASE),
    'education': re.compile(r'^(education|academic\s+background|qualifications)(\s*[:\-])?$', re.IGNORECASE),
    'projects': re.compile(r'^(projects|personal\s+projects|key\s+projects|academic\s+projects)(\s*[:\-])?$', re.IGNORECASE),
    'certifications': re.compile(r'^(certifications|licenses|credentials|certificates)(\s*[:\-])?$', re.IGNORECASE),
    'achievements': re.compile(r'^(achievements|honors|awards|accomplishments)(\s*[:\-])?$', re.IGNORECASE),
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize unicode bullets
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\uF0B7]', '\n• ', text)
    # Remove control characters except standard whitespace
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    # Normalize excessive newlines and whitespace
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for page in reader.pages:
            t = page.extract_text() or ""
            extracted_pages.append(t)
        return clean_text("\n".join(extracted_pages))
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)
        return clean_text("\n".join(paragraphs))
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

def extract_contact_info(text: str) -> Tuple[ContactInfo, List[str]]:
    contact = ContactInfo()
    privacy_flags = []

    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        first_line = lines[0]
        # If first line is not a heading or contact info, treat as name
        if len(first_line) < 50 and not '@' in first_line and not any(kw in first_line.lower() for kw in ['resume', 'curriculum', 'vitae']):
            contact.name = first_line

    emails = EMAIL_REGEX.findall(text)
    if emails:
        contact.email = emails[0]

    phones = PHONE_REGEX.findall(text)
    if phones:
        match = PHONE_REGEX.search(text)
        if match:
            contact.phone = match.group(0).strip()

    linkedin_matches = LINKEDIN_REGEX.findall(text)
    if linkedin_matches:
        contact.linkedin = f"https://linkedin.com/in/{linkedin_matches[0]}"

    github_matches = GITHUB_REGEX.findall(text)
    if github_matches:
        contact.github = f"https://github.com/{github_matches[0]}"

    # Privacy check: Street Address
    if STREET_ADDRESS_REGEX.search(text):
        privacy_flags.append("Full street address detected. For safety and modern ATS best practices, only City and State/Country are recommended.")

    # Privacy check: Postal code
    if POSTAL_CODE_REGEX.search(text):
        privacy_flags.append("Postal/ZIP code detected. Consider removing to reduce unconscious bias and unnecessary personal exposure.")

    return contact, privacy_flags

def segment_sections(text: str) -> Dict[str, str]:
    lines = text.split('\n')
    sections = {}
    current_section = 'header'
    current_content = []

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue
        
        # Check if line looks like a section header (short, matches pattern)
        if len(cleaned) < 45:
            matched_sec = None
            for sec_name, pattern in SECTION_PATTERNS.items():
                if pattern.match(cleaned):
                    matched_sec = sec_name
                    break
            
            if matched_sec:
                if current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = matched_sec
                current_content = []
                continue

        current_content.append(cleaned)

    if current_content:
        sections[current_section] = "\n".join(current_content)

    return sections

def parse_experience_section(content: str) -> List[ExperienceEntry]:
    entries = []
    if not content:
        return entries

    blocks = content.split('\n• ')
    first_block = blocks[0].split('\n')
    
    current_title = "Role"
    current_company = "Company"
    bullets = []
    
    for i, line in enumerate(first_block):
        if i == 0 and len(line) < 60:
            parts = re.split(r'[-–|at]\s+', line)
            if len(parts) >= 2:
                current_title = parts[0].strip()
                current_company = parts[1].strip()
            else:
                current_title = line.strip()
        elif line.startswith('•') or line.startswith('-') or line.startswith('*'):
            bullets.append(line.lstrip('•-* ').strip())
        elif len(line) > 20:
            bullets.append(line)

    for block in blocks[1:]:
        bullets.append(block.strip())

    entries.append(ExperienceEntry(
        title=current_title,
        company=current_company,
        bullets=bullets[:8]
    ))
    return entries

def parse_education_section(content: str) -> List[EducationEntry]:
    entries = []
    if not content:
        return entries
    
    lines = [l.strip() for l in content.split('\n') if l.strip()]
    degree = "Degree / Field of Study"
    institution = "University / College"
    grad_year = None

    year_match = re.search(r'\b(19\d{2}|20\d{2})\b', content)
    if year_match:
        grad_year = year_match.group(0)

    for line in lines:
        if any(w in line.lower() for w in ['bachelor', 'master', 'bs', 'ms', 'b.tech', 'm.tech', 'phd', 'associate']):
            degree = line
        elif any(w in line.lower() for w in ['university', 'college', 'institute', 'school']):
            institution = line

    entries.append(EducationEntry(
        degree=degree,
        institution=institution,
        graduation_year=grad_year
    ))
    return entries

def parse_resume_bytes(file_bytes: bytes, filename: str) -> ParsedResume:
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        raw_text = extract_text_from_docx(file_bytes)
    elif ext == 'txt':
        raw_text = clean_text(file_bytes.decode('utf-8', errors='ignore'))
    else:
        raise ValueError(f"Unsupported document format: {ext}. Accepted formats: PDF, DOCX, TXT")

    contact, privacy_flags = extract_contact_info(raw_text)
    sections = segment_sections(raw_text)
    
    summary = sections.get('summary', None)
    experience = parse_experience_section(sections.get('experience', ''))
    education = parse_education_section(sections.get('education', ''))
    
    detected_sections = list(sections.keys())
    word_count = len(raw_text.split())
    
    warnings = []
    if word_count < 200:
        warnings.append("Resume word count is low (< 200 words). Ensure complete descriptions of your projects and experience.")
    elif word_count > 1200:
        warnings.append("Resume word count is quite high (> 1200 words). Consider condensing to 1-2 focused pages (450-900 words).")

    if 'skills' not in sections:
        warnings.append("No dedicated 'Skills' section detected. Adding an explicit Skills section improves ATS indexing.")

    return ParsedResume(
        raw_text=raw_text,
        contact=contact,
        summary=summary,
        experience=experience,
        education=education,
        word_count=word_count,
        section_count=len(detected_sections),
        detected_sections=detected_sections,
        warnings=warnings,
        privacy_flags=privacy_flags,
        extraction_confidence=0.92
    )
