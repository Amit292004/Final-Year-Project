import re
import io
import os
from typing import List, Dict, Any, Tuple, Optional
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

MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

SUPPORTED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}

class FileParsingError(Exception):
    pass

class FileValidationError(Exception):
    pass

def validate_file(file_data: bytes, filename: str) -> Tuple[bool, str, Optional[str]]:
    file_size_bytes = len(file_data)
    if file_size_bytes > MAX_FILE_SIZE_BYTES:
        size_mb = file_size_bytes / (1024 * 1024)
        return False, (
            f'File size ({size_mb:.2f} MB) exceeds maximum limit of {MAX_FILE_SIZE_MB} MB. '
            'Please compress or upload a smaller file.'
        ), None

    if file_size_bytes == 0:
        return False, 'Uploaded file is empty. Please verify your file.', None

    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return False, f'Unsupported file extension: {ext}. Supported formats: PDF, DOCX, DOC, TXT', None

    file_type = ext.lstrip('.')
    return True, '', file_type

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\uF0B7]', '\n• ', text)
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def _extract_pdf_hyperlinks(file_data: bytes) -> str:
    urls = []
    try:
        reader = PdfReader(io.BytesIO(file_data))
        for page in reader.pages:
            if '/Annots' not in page:
                continue
            annots = page.get('/Annots')
            if not annots:
                continue
            for annot_ref in annots:
                try:
                    annot = annot_ref.get_object() if hasattr(annot_ref, 'get_object') else annot_ref
                    if annot.get('/Subtype') != '/Link':
                        continue
                    action = annot.get('/A', {})
                    uri = action.get('/URI', '')
                    if uri and isinstance(uri, str) and uri.startswith('http'):
                        urls.append(uri.strip())
                except Exception:
                    pass
    except Exception:
        pass
    return '\n'.join(urls)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for page in reader.pages:
            t = page.extract_text() or ""
            extracted_pages.append(t)
        text = "\n".join(extracted_pages)
        links = _extract_pdf_hyperlinks(file_bytes)
        if links:
            text += "\n" + links
        return clean_text(text)
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise FileParsingError(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)

        text = "\n".join(paragraphs)
        try:
            for rel in doc.part.rels.values():
                if 'hyperlink' in rel.reltype.lower():
                    url = getattr(rel, '_target', None) or getattr(rel, 'target_ref', None)
                    if isinstance(url, str) and url.startswith('http'):
                        text += '\n' + url
        except Exception:
            pass

        return clean_text(text)
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        raise FileParsingError(f"Failed to extract text from DOCX: {str(e)}")

def extract_text_from_doc(file_bytes: bytes) -> str:
    raise FileParsingError(
        'Legacy .doc format is not directly supported. '
        'Please save or convert your document to .docx or .pdf format.'
    )

def extract_text(file_data: bytes, file_type: str) -> str:
    if file_type == 'pdf':
        return extract_text_from_pdf(file_data)
    elif file_type == 'docx':
        return extract_text_from_docx(file_data)
    elif file_type == 'doc':
        return extract_text_from_doc(file_data)
    elif file_type == 'txt':
        return clean_text(file_data.decode('utf-8', errors='ignore'))
    else:
        raise FileValidationError(f"Invalid file type: {file_type}. Supported: pdf, docx, txt")

def parse_resume_file(file_data: bytes, filename: str) -> Tuple[str, dict]:
    is_valid, error_msg, file_type = validate_file(file_data, filename)
    if not is_valid:
        raise FileValidationError(error_msg)

    text = extract_text(file_data, file_type)
    if not text.strip():
        raise FileParsingError("No readable text could be extracted from the file.")

    metadata = {
        'filename': filename,
        'file_type': file_type,
        'file_size_bytes': len(file_data),
        'text_length': len(text),
        'success': True
    }
    return text, metadata

def extract_contact_info(text: str) -> Tuple[ContactInfo, List[str]]:
    contact = ContactInfo()
    privacy_flags = []

    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        first_line = lines[0]
        if len(first_line) < 50 and '@' not in first_line and not any(kw in first_line.lower() for kw in ['resume', 'curriculum', 'vitae']):
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

    if STREET_ADDRESS_REGEX.search(text):
        privacy_flags.append("Full street address detected. For safety and modern ATS best practices, only City and State/Country are recommended.")

    if POSTAL_CODE_REGEX.search(text):
        privacy_flags.append("Postal/ZIP code detected. Consider removing to reduce unconscious bias and unnecessary personal exposure.")

    return contact, privacy_flags

SECTION_PATTERNS = {
    'summary': re.compile(r'^(professional\s+summary|summary|profile|about\s+me|objective)(\s*[:\-])?$', re.IGNORECASE),
    'skills': re.compile(r'^(technical\s+skills|skills|core\s+competencies|technologies|tools)(\s*[:\-])?$', re.IGNORECASE),
    'experience': re.compile(r'^(work\s+experience|professional\s+experience|experience|employment\s+history)(\s*[:\-])?$', re.IGNORECASE),
    'education': re.compile(r'^(education|academic\s+background|qualifications)(\s*[:\-])?$', re.IGNORECASE),
    'projects': re.compile(r'^(projects|personal\s+projects|key\s+projects|academic\s+projects)(\s*[:\-])?$', re.IGNORECASE),
    'certifications': re.compile(r'^(certifications|licenses|credentials|certificates)(\s*[:\-])?$', re.IGNORECASE),
    'achievements': re.compile(r'^(achievements|honors|awards|accomplishments)(\s*[:\-])?$', re.IGNORECASE),
}

def segment_sections(text: str) -> Dict[str, str]:
    lines = text.split('\n')
    sections = {}
    current_section = 'header'
    current_content = []

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue

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
    text, meta = parse_resume_file(file_bytes, filename)

    contact, privacy_flags = extract_contact_info(text)
    sections = segment_sections(text)

    summary = sections.get('summary', None)
    experience = parse_experience_section(sections.get('experience', ''))
    education = parse_education_section(sections.get('education', ''))

    detected_sections = list(sections.keys())
    word_count = len(text.split())

    warnings = []
    if word_count < 200:
        warnings.append("Resume word count is low (< 200 words). Ensure complete descriptions of your projects and experience.")
    elif word_count > 1200:
        warnings.append("Resume word count is quite high (> 1200 words). Consider condensing to 1-2 focused pages (450-900 words).")

    if 'skills' not in sections:
        warnings.append("No dedicated 'Skills' section detected. Adding an explicit Skills section improves ATS indexing.")

    return ParsedResume(
        raw_text=text,
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
