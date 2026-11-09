import io
import logging
from typing import Dict
from backend.core.logging import logger

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_INSTALLED = True
except ImportError:
    WEASYPRINT_INSTALLED = False

def generate_combined_pdf(html_docs: Dict[str, str]) -> bytes:
    """
    Combines rendered HTML reports and exports to PDF bytes using WeasyPrint
    if installed, or returns formatted HTML bytes.
    """
    if not WEASYPRINT_INSTALLED:
        logger.info("WeasyPrint not installed — returning combined HTML bytes for print/export.")
        combined_html = "\n<div style='page-break-after:always;'></div>\n".join(html_docs.values())
        return combined_html.encode('utf-8')

    documents = []
    for name, html_str in html_docs.items():
        doc = HTML(string=html_str).render()
        documents.append(doc)

    if not documents:
        return b""

    first_doc = documents[0]
    for other_doc in documents[1:]:
        for page in other_doc.pages:
            first_doc.pages.append(page)

    return first_doc.write_pdf()
