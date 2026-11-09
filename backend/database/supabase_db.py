import logging
import httpx
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from backend.core.config import settings
from backend.core.logging import logger

# In-memory store fallback for offline/local development
_local_history_store: Dict[str, List[Dict[str, Any]]] = {}

def _get_headers() -> Optional[Dict[str, str]]:
    supabase_url = getattr(settings, 'SUPABASE_URL', None)
    supabase_key = getattr(settings, 'SUPABASE_KEY', None)
    if not supabase_url or not supabase_key:
        return None
    return {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

async def save_analysis(user_id: str, filename: str, analysis_result: Dict) -> Optional[str]:
    headers = _get_headers()
    supabase_url = getattr(settings, 'SUPABASE_URL', None)

    def _json_default(o):
        if hasattr(o, 'model_dump'):
            return o.model_dump()
        return str(o)

    serializable_result = json.loads(json.dumps(analysis_result, default=_json_default))

    doc = {
        "user_id": user_id,
        "filename": filename,
        "ats_score": serializable_result.get("ats_score", serializable_result.get("ATS_score", 0)),
        "keyword_match": serializable_result.get("keyword_match", 0),
        "missing_keywords": serializable_result.get("missing_keywords", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "analysis_result": serializable_result,
    }

    if headers and supabase_url:
        url = f"{supabase_url.rstrip('/')}/rest/v1/analyses"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=doc)
                if response.status_code in (200, 201):
                    data = response.json()
                    if data and len(data) > 0:
                        inserted_id = str(data[0].get("id"))
                        logger.info(f"Saved analysis to Supabase for user {user_id}: {inserted_id}")
                        return inserted_id
        except Exception as exc:
            logger.warning(f"Supabase write failed ({exc}) — saving to local memory store fallback.")

    # Fallback in-memory
    entry_id = str(uuid.uuid4())
    doc["id"] = entry_id
    if user_id not in _local_history_store:
        _local_history_store[user_id] = []
    _local_history_store[user_id].insert(0, doc)
    return entry_id

async def get_user_history(user_id: str) -> List[Dict]:
    headers = _get_headers()
    supabase_url = getattr(settings, 'SUPABASE_URL', None)

    if headers and supabase_url:
        url = f"{supabase_url.rstrip('/')}/rest/v1/analyses"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    url,
                    headers=headers,
                    params={
                        "user_id": f"eq.{user_id}",
                        "order": "created_at.desc"
                    }
                )
                if response.status_code == 200:
                    docs = response.json()
                    results = []
                    for doc in docs:
                        results.append({
                            "id": str(doc.get("id")),
                            "filename": doc.get("filename", "resume"),
                            "resume_name": doc.get("filename", "resume"),
                            "job_title": "Software Engineer",
                            "ats_score": doc.get("ats_score", 0),
                            "keyword_match": doc.get("keyword_match", 0),
                            "missing_keywords": doc.get("missing_keywords", []),
                            "date": doc.get("created_at", ""),
                            "created_at": doc.get("created_at", ""),
                            "analysis_result": doc.get("analysis_result", {}),
                        })
                    return results
        except Exception as exc:
            logger.warning(f"Supabase get_history failed ({exc}) — using local memory store fallback.")

    # Fallback in-memory
    items = _local_history_store.get(user_id, [])
    results = []
    for doc in items:
        results.append({
            "id": str(doc.get("id")),
            "filename": doc.get("filename", "resume"),
            "resume_name": doc.get("filename", "resume"),
            "job_title": "Software Engineer",
            "ats_score": doc.get("ats_score", 0),
            "keyword_match": doc.get("keyword_match", 0),
            "missing_keywords": doc.get("missing_keywords", []),
            "date": doc.get("created_at", ""),
            "created_at": doc.get("created_at", ""),
            "analysis_result": doc.get("analysis_result", {}),
        })
    return results

async def delete_analysis(analysis_id: str, user_id: str) -> bool:
    headers = _get_headers()
    supabase_url = getattr(settings, 'SUPABASE_URL', None)

    if headers and supabase_url:
        url = f"{supabase_url.rstrip('/')}/rest/v1/analyses"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.delete(
                    url,
                    headers=headers,
                    params={
                        "id": f"eq.{analysis_id}",
                        "user_id": f"eq.{user_id}"
                    }
                )
                if response.status_code in (200, 204):
                    return True
        except Exception as exc:
            logger.warning(f"Supabase delete failed ({exc}) — attempting local store deletion.")

    # Fallback in-memory
    if user_id in _local_history_store:
        orig_len = len(_local_history_store[user_id])
        _local_history_store[user_id] = [d for d in _local_history_store[user_id] if d.get("id") != analysis_id]
        return len(_local_history_store[user_id]) < orig_len
    return False
