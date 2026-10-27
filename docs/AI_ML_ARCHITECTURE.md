# CareerFit AI — AI/ML Subsystem Architecture

## Overview

The CareerFit AI intelligence layer operates as a dedicated Python FastAPI microservice (port 8000), decoupling high-latency document parsing, NLP feature extraction, dense vector embeddings, and LLM inference from the Node.js Express API gateway (port 5000).

```
[ Candidate Resume / JD ]
           │
           ▼
[ Resume Parser (pypdf / python-docx) ]
           │
           ▼
[ Skill Extractor (Taxonomy + RapidFuzz) ] ──▶ [ Canonical Normalization ]
           │
           ├──▶ [ ATS Scorer (100-Point Formula) ]
           │
           ├──▶ [ Sentence Transformers (384-d Embeddings) ] ──▶ [ Cosine Matching ]
           │
           ├──▶ [ RAG Knowledge Base (Supabase pgvector) ]
           │
           └──▶ [ LLM Provider Adapter (Groq llama-3.3-70b-versatile / Fallback) ]
```

---

## 1. Resume Parsing & Section Segmentation
- **Extractors**: `pypdf` for PDF stream decompression; `python-docx` for XML paragraph and table extraction; UTF-8 decoder for TXT.
- **Normalization**: Unicode bullet point unification (`\u2022`, `\u25E6`, etc.), non-printable character stripping, whitespace normalization.
- **Heading Classifier**: Case-insensitive anchored boundary regular expressions detecting Summary, Skills, Experience, Education, Projects, and Certifications.
- **Privacy Engine**: Flagging full street address patterns and postal codes to promote modern candidate data hygiene.

---

## 2. Skill Taxonomy & RapidFuzz Alias Resolution
- 500+ curated technical competencies mapped across programming languages, web frameworks, databases, cloud, devops, testing, architecture, and soft skills.
- Multi-token regex word-boundary lookup combined with RapidFuzz ratio thresholding for fuzzy abbreviation matching.

---

## 3. Semantic Embedding & Job Matching
- **Dense Embedding Model**: `all-MiniLM-L6-v2` projecting text into 384-dimensional unit-normalized vector space.
- **Cosine Similarity**:
  $$\text{CosineSimilarity}(u, v) = \frac{u \cdot v}{\|u\| \|v\|}$$
- **Scoring Weights**:
  - Required Skills Match: 40%
  - Preferred Skills Match: 20%
  - Semantic Embedding Cosine Similarity: 25%
  - Experience Alignment: 15%

---

## 4. LLM Feedback & RAG Mock Interviews
- **Provider**: Groq API with `llama-3.3-70b-versatile` (temperature 0.2) producing structured JSON responses validated against Pydantic schemas.
- **RAG Context Retrieval**: Overlapping 500-token chunks with 50-token window; cosine retrieval across `knowledge_chunks` table in PostgreSQL with pgvector.
- **STAR Answer Evaluation**: Situation, Task, Action, and Result heuristic identification with 0–10 technical depth and clarity scores.
