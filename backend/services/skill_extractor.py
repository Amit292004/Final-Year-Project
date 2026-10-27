import os
import json
import re
from typing import List, Dict, Any, Tuple
from rapidfuzz import fuzz
from backend.core.logging import logger

TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skill_taxonomy.json")

class SkillExtractor:
    def __init__(self):
        self.taxonomy = []
        self._load_taxonomy()

    def _load_taxonomy(self):
        try:
            if os.path.exists(TAXONOMY_PATH):
                with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.taxonomy = data.get("skills", [])
            else:
                logger.warning(f"Skill taxonomy file not found at {TAXONOMY_PATH}, using fallback list")
        except Exception as e:
            logger.error(f"Failed to load skill taxonomy: {e}")

    def extract_skills_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extracts and normalizes skills from resume or job text.
        Returns extracted skills list and categorized map.
        """
        if not text:
            return {"skills": [], "categorized": {}, "evidence": []}

        found_skills = {}
        text_lower = text.lower()
        # Clean punctuation for token matching
        tokens = set(re.findall(r'\b[a-zA-Z0-9\+\#\.\-]+\b', text_lower))

        for entry in self.taxonomy:
            canonical = entry["canonical_name"]
            category = entry.get("category", "technical")
            aliases = [canonical.lower()] + [a.lower() for a in entry.get("aliases", [])]

            matched = False
            match_type = "exact"
            matched_alias = None

            # 1. Exact boundary match for multi-word or single-word alias
            for alias in aliases:
                # Use regex word boundaries
                escaped = re.escape(alias)
                pattern = rf'(?<!\w){escaped}(?!\w)'
                if re.search(pattern, text_lower):
                    matched = True
                    matched_alias = alias
                    match_type = "exact"
                    break

            # 2. Fuzzy match for longer technical terms (length > 5) if not matched yet
            if not matched:
                for alias in aliases:
                    if len(alias) > 5 and alias in text_lower:
                        matched = True
                        matched_alias = alias
                        match_type = "substring"
                        break

            if matched:
                found_skills[canonical] = {
                    "canonical_name": canonical,
                    "category": category,
                    "matched_text": matched_alias,
                    "match_type": match_type,
                    "confidence": 0.95 if match_type == "exact" else 0.85,
                    "evidence_status": "explicit"
                }

        # Organize into categories
        categorized = {}
        for skill_info in found_skills.values():
            cat = skill_info["category"]
            if cat not in categorized:
                categorized[cat] = []
            categorized[cat].append(skill_info["canonical_name"])

        return {
            "skills": sorted(list(found_skills.keys())),
            "categorized": categorized,
            "evidence": list(found_skills.values())
        }

skill_extractor = SkillExtractor()
