import os
import jinja2
from datetime import datetime
from typing import Dict, Any
from backend.core.logging import logger

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(TEMPLATE_DIR),
    autoescape=jinja2.select_autoescape(['html', 'xml'])
)

def render_assessment_report_html(assessment_data: Dict[str, Any], candidate_name: str = "Candidate", target_role: str = "Software Engineer") -> str:
    """
    Renders HTML assessment report using Jinja2 with autoescaping.
    """
    try:
        template = env.get_template("report.html")
        context = {
            "candidate_name": candidate_name,
            "target_role": target_role,
            "date": datetime.now().strftime("%B %d, %Y"),
            "overall_score": assessment_data.get("overall_score", 0),
            "readiness_level": assessment_data.get("readiness_level", "Improvement Recommended"),
            "category_scores": assessment_data.get("category_scores", {}),
            "strengths": assessment_data.get("strengths", []),
            "critical_issues": assessment_data.get("critical_issues", []),
            "bullet_point_rewrites": assessment_data.get("bullet_point_rewrites", [])
        }
        return template.render(**context)
    except Exception as e:
        logger.error(f"Error rendering assessment HTML report: {e}")
        raise ValueError(f"Report rendering error: {str(e)}")
