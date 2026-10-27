import hashlib
import numpy as np
from typing import List, Union
from backend.core.config import settings
from backend.core.logging import logger

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.dimension = settings.EMBEDDING_DIMENSION
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info(f"Loaded sentence transformer model: {settings.EMBEDDING_MODEL}")
        except Exception as e:
            logger.warning(f"SentenceTransformer not available or failed to load ({e}). Using deterministic 384-d semantic projection fallback.")

    def _deterministic_embedding(self, text: str) -> np.ndarray:
        """
        Generates a normalized 384-dimensional vector deterministically from text tokens.
        Preserves cosine similarity properties for identical or near-identical text.
        """
        words = text.lower().split()
        vec = np.zeros(self.dimension, dtype=np.float32)
        if not words:
            return vec

        for word in words:
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            for i in range(8):
                idx = (h >> (i * 12)) % self.dimension
                val = (((h >> (i * 12 + 4)) & 0xFF) - 128) / 128.0
                vec[idx] += val

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]

        if self.model:
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings
            except Exception as e:
                logger.error(f"Error in model encoding: {e}. Falling back to deterministic embedding.")

        vectors = [self._deterministic_embedding(t) for t in texts]
        return np.array(vectors, dtype=np.float32)

    def cosine_similarity(self, u: np.ndarray, v: np.ndarray) -> float:
        """
        Cosine similarity: (u · v) / (||u|| * ||v||)
        """
        norm_u = np.linalg.norm(u)
        norm_v = np.linalg.norm(v)
        if norm_u == 0 or norm_v == 0:
            return 0.0
        return float(np.dot(u, v) / (norm_u * norm_v))

embedding_service = EmbeddingService()
