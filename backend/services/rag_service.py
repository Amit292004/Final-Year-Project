import re
from typing import List, Dict, Any, Optional
from backend.services.embedding_service import embedding_service
from backend.core.logging import logger

def chunk_document(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits document into readable chunks with sliding window overlap.
    """
    if not text:
        return []
    
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks

class RAGService:
    def __init__(self):
        pass

    def prepare_chunks_for_indexing(self, text: str, source_type: str, source_id: Optional[str] = None) -> List[Dict[str, Any]]:
        raw_chunks = chunk_document(text)
        if not raw_chunks:
            return []

        embeddings = embedding_service.encode(raw_chunks)
        results = []
        for i, chunk in enumerate(raw_chunks):
            results.append({
                "content": chunk,
                "embedding": embeddings[i].tolist(),
                "source_type": source_type,
                "source_id": source_id,
                "metadata": {
                    "chunk_index": i,
                    "total_chunks": len(raw_chunks),
                    "word_count": len(chunk.split())
                }
            })
        return results

    def retrieve_relevant_chunks(self, query: str, candidate_chunks: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        In-memory cosine similarity retrieval for candidate chunks.
        """
        if not candidate_chunks or not query:
            return []

        query_vec = embedding_service.encode(query)[0]
        scored_chunks = []

        for chunk in candidate_chunks:
            emb = chunk.get("embedding")
            if emb:
                import numpy as np
                sim = embedding_service.cosine_similarity(query_vec, np.array(emb, dtype=np.float32))
                scored_chunks.append({
                    **chunk,
                    "similarity": round(sim, 4)
                })

        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_chunks[:top_k]

rag_service = RAGService()
