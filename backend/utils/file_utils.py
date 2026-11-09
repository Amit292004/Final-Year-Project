from typing import Dict, Any, List, Optional
from backend.core.logging import logger

def get_default_grammar_results() -> Dict[str, Any]:
    return {
        'total_errors': 0,
        'critical_errors': [],
        'moderate_errors': [],
        'minor_errors': [],
        'grammar_score': 100,
        'penalty_applied': 0.0,
        'error_free_percentage': 100,
        '_component_status': 'unavailable',
        '_note': 'Grammar checking clean.'
    }

def get_default_location_results() -> Dict[str, Any]:
    return {
        'location_found': False,
        'detected_locations': [],
        'privacy_risk': 'none',
        'recommendations': ['No privacy concerns detected.'],
        'penalty_applied': 0.0,
        '_component_status': 'available'
    }

def get_default_skill_validation_results() -> Dict[str, Any]:
    return {
        'validated_skills': [],
        'unvalidated_skills': [],
        'validation_percentage': 0.0,
        'skill_project_mapping': {},
        'validation_score': 0.0,
        '_component_status': 'unavailable'
    }

def get_default_jd_comparison_results() -> Dict[str, Any]:
    return {
        'semantic_similarity': 0.0,
        'matched_keywords': [],
        'missing_keywords': [],
        'skills_gap': [],
        'match_percentage': 0.0,
        '_component_status': 'unavailable'
    }
