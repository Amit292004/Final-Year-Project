import os
from datetime import datetime
from typing import Dict, Any, List
import jinja2
from backend.core.logging import logger

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(TEMPLATE_DIR),
    autoescape=jinja2.select_autoescape(['html', 'xml'])
)

def format_date(value, fmt='%B %d, %Y at %I:%M %p'):
    if not value:
        return ''
    try:
        dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return dt.strftime(fmt)
    except Exception:
        return value

env.filters['format_date'] = format_date

def generate_html_reports(analysis_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Renders modular HTML reports (summary, skill_report, jd_report, recommendations)
    using Shradha Khapra repository logic and Jinja2 templates.
    """
    now = datetime.now().isoformat()
    overall_score = analysis_data.get('ATS_score', 0) or analysis_data.get('overall_score', 0)
    interpretation = analysis_data.get('interpretation') or ''

    cs = analysis_data.get('component_scores') or analysis_data.get('category_scores') or {}
    if hasattr(cs, '__dict__'):
        cs = cs.__dict__

    def get_score(key_variants):
        for k in key_variants:
            if k in cs:
                val = cs[k]
                if isinstance(val, dict):
                    return float(val.get('score', 0.0))
                if hasattr(val, 'score'):
                    return float(val.score)
                return float(val)
        return 0.0

    component_scores = {
        'formatting': get_score(['formatting']),
        'keywords': get_score(['keywords']),
        'content': get_score(['content', 'content_quality']),
        'skill_validation': get_score(['skill_validation', 'skill_depth']),
        'ats_compatibility': get_score(['ats_compatibility', 'compatibility']),
    }

    def pct(score, max_score):
        return min(100, max(0, round(score / max_score * 100)))

    component_pct = {
        'formatting': pct(component_scores['formatting'], 20),
        'keywords': pct(component_scores['keywords'], 25),
        'content': pct(component_scores['content'], 25),
        'skill_validation': pct(component_scores['skill_validation'], 15),
        'ats_compatibility': pct(component_scores['ats_compatibility'], 15),
    }

    raw_feedback = analysis_data.get('detailed_feedback', [])

    def to_dict(item):
        if isinstance(item, dict):
            return item
        return item.model_dump() if hasattr(item, 'model_dump') else item.__dict__

    detailed_feedback = [to_dict(fb) for fb in raw_feedback]

    high_priority = [fb for fb in detailed_feedback if fb.get('severity_level', '').lower() in ('high',)]
    medium_priority = [fb for fb in detailed_feedback if fb.get('severity_level', '').lower() in ('moderate', 'medium')]
    low_priority = [fb for fb in detailed_feedback if fb.get('severity_level', '').lower() in ('low', 'info')]

    strengths = analysis_data.get('strengths', [])

    svd_raw = analysis_data.get('skill_validation_details') or {}
    if hasattr(svd_raw, 'model_dump'):
        svd_raw = svd_raw.model_dump()

    validated_skills = svd_raw.get('validated', [])
    unvalidated_skills = svd_raw.get('unvalidated', [])
    total_skills = svd_raw.get('total', len(validated_skills) + len(unvalidated_skills))
    validated_count = svd_raw.get('validated_count', len(validated_skills))
    validation_pct = svd_raw.get('validation_pct', 0.0)

    jd_raw = analysis_data.get('jd_match_analysis') or analysis_data.get('jd_comparison')
    if hasattr(jd_raw, 'model_dump'):
        jd_raw = jd_raw.model_dump()

    if overall_score >= 80:
        score_color = '#16a34a'
    elif overall_score >= 60:
        score_color = '#d97706'
    else:
        score_color = '#dc2626'

    context = {
        'timestamp': now,
        'overall_score': overall_score,
        'score_color': score_color,
        'interpretation': interpretation,
        'component_scores': component_scores,
        'component_pct': component_pct,
        'strengths': strengths,
        'high_priority': high_priority,
        'medium_priority': medium_priority,
        'low_priority': low_priority,
        'all_feedback': detailed_feedback,
        'validated_skills': validated_skills,
        'unvalidated_skills': unvalidated_skills,
        'total_skills': total_skills,
        'validated_count': validated_count,
        'validation_pct': validation_pct,
        'jd_analysis': jd_raw,
    }

    return {
        'summary': env.get_template('summary.html').render(**context),
        'skill_report': env.get_template('action_items.html').render(**context),
        'jd_report': env.get_template('quick_actions.html').render(**context),
        'recommendations': env.get_template('jd_comparison.html').render(**context),
    }

def render_assessment_report_html(
    assessment_data: Dict[str, Any],
    candidate_name: str = "Candidate",
    target_role: str = "Software Engineer"
) -> str:
    """
    Renders HTML assessment report. First attempts the rich Shradha Khapra summary report,
    falling back to report.html if needed.
    """
    try:
        reports = generate_html_reports(assessment_data)
        if 'summary' in reports and len(reports['summary']) > 100:
            return reports['summary']
    except Exception as e:
        logger.warning(f"Rich summary template generation failed ({e}), using report.html fallback.")

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
