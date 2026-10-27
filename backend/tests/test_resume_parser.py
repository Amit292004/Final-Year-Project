import pytest
from backend.services.resume_parser import clean_text, extract_contact_info, segment_sections, parse_resume_bytes

def test_clean_text():
    raw = "Bullet \u2022 Item 1 \r\n Bullet \u25E6 Item 2"
    cleaned = clean_text(raw)
    assert "Item 1" in cleaned
    assert "Item 2" in cleaned
    assert "\r\n" not in cleaned

def test_extract_contact_info():
    text = "Jane Doe\nEmail: jane.doe@example.com\nPhone: (555) 123-4567\nLinkedIn: linkedin.com/in/janedoe"
    contact, privacy = extract_contact_info(text)
    assert contact.email == "jane.doe@example.com"
    assert "janedoe" in contact.linkedin
    assert contact.phone is not None

def test_privacy_detection():
    text = "Address: 742 Evergreen Terrace, Springfield, OR 97477\nEmail: test@example.com"
    _, privacy = extract_contact_info(text)
    assert len(privacy) > 0
    assert any("street address" in p.lower() for p in privacy)

def test_segment_sections():
    text = "Jane Doe\nPROFESSIONAL SUMMARY\nExperienced engineer.\nTECHNICAL SKILLS\nPython, React\nWORK EXPERIENCE\nSoftware Engineer at Tech Corp\nEDUCATION\nBS Computer Science"
    sections = segment_sections(text)
    assert "summary" in sections
    assert "skills" in sections
    assert "experience" in sections
    assert "education" in sections

def test_parse_txt_resume():
    sample = b"John Smith\njohn@example.com\n(555) 987-6543\nSKILLS\nPython, Docker, SQL\nEXPERIENCE\nSoftware Engineer - Acme Inc\n- Built high throughput APIs with 99.9% uptime\nEDUCATION\nBS in Computer Science, State University, 2024"
    parsed = parse_resume_bytes(sample, "resume.txt")
    assert parsed.contact.email == "john@example.com"
    assert parsed.word_count > 10
    assert "skills" in parsed.detected_sections
