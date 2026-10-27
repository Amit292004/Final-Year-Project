# CareerFit AI — Career Intelligence SaaS Platform

> **AI-Powered Resume ATS Scoring, Semantic Job Matching, Skill Gap Analysis, RAG Interview Preparation, and Career Roadmaps.**

---

## 1. Product Identity

- **Category**: AI/ML-Powered SaaS Career Intelligence Platform
- **Design System**: Premium Carbon Black (`#171717`) and Signature Orange (`#F97316`) identity, Warm Ivory (`#F7F5F0`) canvas, Manrope headlines, Inter typography, Lucide SVG iconography.
- **Relational & Vector Database**: Supabase PostgreSQL with `pgvector` & Row Level Security (RLS).

---

## 2. Technology Stack & Ports

| Layer | Technology | Local Port |
|---|---|---:|
| **Frontend** | React, Vite, Tailwind CSS, Recharts, Lucide | `5173` |
| **Application Gateway** | Node.js, Express.js | `5000` |
| **AI/ML Service** | Python, FastAPI, RapidFuzz, pypdf, python-docx | `8000` |
| **Database & Vector** | Supabase PostgreSQL + pgvector (384-d HNSW) | Managed |
| **Authentication** | Supabase Auth | Managed |
| **Document Storage** | Supabase Storage (Private `resumes` bucket) | Managed |

---

## 3. Core Modules Implemented

1. **Public Marketing Website**: Hero ("Build Your Career With Clarity."), Product UI preview, Features breakdown, How It Works, Pricing tiers, FAQ accordion.
2. **Authentication Flow**: Login, Signup with password strength meter, Forgot Password, and session state.
3. **Candidate Onboarding Wizard**: 4-step wizard capturing career status, target role, technical skills, and weekly study hours.
4. **Career Dashboard**: 4 key metrics (Resume Readiness, Best Match %, Skills to Improve, Interview Practice), score trends, and quick actions.
5. **Resume Intelligence & Library**: Upload PDF/DOCX (<= 5 MB), text extraction, and parsing status.
6. **100-Point ATS Readiness Scorer**: Deterministic scoring across Formatting (20 pts), Keywords (25 pts), Content Quality (20 pts), Skill Depth (20 pts), and ATS Compatibility (15 pts).
7. **Document Workspace & AI Rewriter**: Section editing with before/after Google X-Y-Z rewrite suggestions (`requires_confirmation` metric flags).
8. **Semantic Job Matching**: Dense sentence embedding cosine similarity against job descriptions, identifying matched vs missing requirements with evidence citations.
9. **Explainable Skill Gap Analysis**: Critical vs partial skill categorization with one-click copy and roadmap generation.
10. **Personalized Learning Roadmaps**: Milestone timelines with practical project exercises, study hour estimates, and task completion toggles.
11. **RAG Mock Interviewer**: Role-specific question generator, Web Speech API voice input, and STAR-method answer evaluation.
12. **AI Strategic Career Advisor**: RAG context retrieval over candidate resume chunks, cited evidence, and interactive chat.
13. **Job Application Tracker**: Kanban board and table views across 8 opportunity stages (Wishlist → Applied → Interview → Offer).
14. **Career Analytics**: Recharts AreaChart for historical ATS score progression and pipeline funnel metrics.
15. **User Settings & Privacy**: Full data portability (JSON export) and cascading account deletion.
16. **Admin Workspace**: System queue monitoring, token throughput, and AI component status.

---

## 4. Quick Start Guide

### 1. Start the Python AI/ML Microservice
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # Windows
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Node.js Express Gateway
```bash
cd server
npm install
npm run dev
```

### 3. Start the React Frontend Client
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. Automated Tests

```bash
# Run Python AI/ML test suite (ATS scoring determinism, JD matching, parsing)
.\backend\venv\Scripts\python -m pytest backend\tests -v

# Run Node.js API test suite
cd server && npm test

# Run Client production build validation
cd client && npm run build
```

---

## 6. Database Migrations

Apply the 13 modular SQL migrations located in `supabase/migrations/`:
- `001_profiles.sql` to `011_admin_audit.sql`
- `012_rls_policies.sql` (Row Level Security across all tables)
- `013_pgvector_setup.sql` (Vector extension, 384-d HNSW index, cosine match RPC)
