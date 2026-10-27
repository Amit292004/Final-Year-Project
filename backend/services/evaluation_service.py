from typing import Dict, Any, List
from backend.services.skill_extractor import skill_extractor
from backend.services.ats_scorer import calculate_ats_readiness_score
from backend.services.embedding_service import embedding_service
from backend.core.logging import logger

GOLDEN_FIXTURES = [
    {
        "text": "Experienced Python and JavaScript Full Stack Engineer with 4 years developing scalable microservices, Docker, PostgreSQL, React, and Redis caching. Reduced query latency by 45%.",
        "expected_skills": ["Python", "JavaScript", "Docker", "PostgreSQL", "React", "Redis"],
        "target_role": "Full Stack Developer"
    },
    {
        "text": "Frontend developer specializing in React, Next.js, TypeScript, and Tailwind CSS. Implemented responsive UI components and optimized Web Vitals.",
        "expected_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        "target_role": "Frontend Developer"
    }
]

def run_ai_evaluations() -> Dict[str, Any]:
    """
    Runs reproducible evaluation metrics across skill extraction, scoring determinism, and vector similarity.
    """
    total_true_positives = 0
    total_false_positives = 0
    total_false_negatives = 0

    # 1. Skill Extraction Precision / Recall / F1
    for fixture in GOLDEN_FIXTURES:
        extracted = skill_extractor.extract_skills_from_text(fixture["text"])
        found = set(extracted["skills"])
        expected = set(fixture["expected_skills"])

        tp = len(found.intersection(expected))
        fp = len(found - expected)
        fn = len(expected - found)

        total_true_positives += tp
        total_false_positives += fp
        total_false_negatives += fn

    precision = total_true_positives / max(1, (total_true_positives + total_false_positives))
    recall = total_true_positives / max(1, (total_true_positives + total_false_negatives))
    f1 = (2 * precision * recall) / max(1e-6, (precision + recall))

    # 2. Scoring Determinism Verification
    sample_text = GOLDEN_FIXTURES[0]["text"]
    score_1 = calculate_ats_readiness_score(sample_text, target_role="Software Engineer")
    score_2 = calculate_ats_readiness_score(sample_text, target_role="Software Engineer")
    is_deterministic = (score_1.overall_score == score_2.overall_score) and (score_1.category_scores["keywords"].score == score_2.category_scores["keywords"].score)

    # 3. Vector Embedding Cosine Consistency
    emb1 = embedding_service.encode("React Frontend Engineer")[0]
    emb2 = embedding_service.encode("React Frontend Developer")[0]
    emb3 = embedding_service.encode("Agricultural Crop Rotation")[0]

    sim_related = embedding_service.cosine_similarity(emb1, emb2)
    sim_unrelated = embedding_service.cosine_similarity(emb1, emb3)
    vector_ranking_valid = sim_related > sim_unrelated

    return {
        "skill_extraction": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "test_fixtures_count": len(GOLDEN_FIXTURES)
        },
        "scoring_engine": {
            "is_deterministic": is_deterministic,
            "overall_score_sample": score_1.overall_score,
            "scoring_version": score_1.scoring_version
        },
        "embedding_ranking": {
            "valid_semantic_ordering": vector_ranking_valid,
            "related_similarity": round(sim_related, 4),
            "unrelated_similarity": round(sim_unrelated, 4),
            "dimension": embedding_service.dimension
        },
        "status": "PASSED" if is_deterministic and vector_ranking_valid else "FAILED"
    }
