# CareerFit AI — REST API Reference

The Node.js Express Gateway operates on port 5000 with versioned route prefix `/api/v1`. All protected routes require a valid Supabase JWT Bearer token: `Authorization: Bearer <token>`.

---

## 1. Profiles & Identity
- `GET /api/v1/profiles/me` — Retrieve candidate profile, skills, and preferences.
- `PATCH /api/v1/profiles/me` — Update target role, location, study hours, or skills.
- `DELETE /api/v1/profiles/me` — Cascading account and record deletion.
- `POST /api/v1/profiles/export` — Export candidate data as JSON.

---

## 2. Resume Intelligence
- `POST /api/v1/resumes/upload` — Multipart file upload (PDF/DOCX, <= 5 MB), extracts sections and skills.
- `GET /api/v1/resumes` — List candidate's uploaded resumes.
- `GET /api/v1/resumes/:resumeId` — Retrieve single resume with parsed details.
- `PATCH /api/v1/resumes/:resumeId` — Update resume title or parsed section content.
- `DELETE /api/v1/resumes/:resumeId` — Remove resume.
- `POST /api/v1/resumes/:resumeId/versions` — Snapshot a new resume revision.

---

## 3. ATS Assessments
- `POST /api/v1/assessments` — Run 100-point ATS readiness scoring and bullet-point rewrites.
- `GET /api/v1/assessments/:id` — Retrieve assessment report.
- `POST /api/v1/assessments/:id/report` — Render downloadable A4 assessment report.

---

## 4. Semantic Job Matching
- `POST /api/v1/jobs` — Save a job description.
- `POST /api/v1/job-matches/matches` — Compute dense embedding cosine match between resume and job posting.
- `GET /api/v1/job-matches/matches` — List historical job matches.

---

## 5. Skills & Learning Roadmaps
- `GET /api/v1/skills/gaps` — Retrieve verified, partial, and missing competencies.
- `POST /api/v1/skills/gaps/analyze` — Run comparison against role requirements.
- `GET /api/v1/roadmaps` — Retrieve candidate's active learning roadmaps.
- `POST /api/v1/roadmaps` — Generate personalized milestone timeline and tasks.
- `PATCH /api/v1/roadmaps/tasks/:taskId` — Update task status (`pending` / `completed`).

---

## 6. AI Mock Interviews & Advisor
- `POST /api/v1/interviews` — Generate role-tailored interview questions.
- `POST /api/v1/interviews/:sessionId/answer` — Evaluate technical depth and STAR clarity.
- `POST /api/v1/interviews/:sessionId/complete` — Conclude interview session and calculate stats.
- `GET /api/v1/advisor/conversations` — List career advising threads.
- `POST /api/v1/advisor/conversations/:id/messages` — Send RAG-assisted advisor message.

---

## 7. Applications & Analytics
- `GET /api/v1/applications` — List tracked opportunities across 8 pipeline stages.
- `POST /api/v1/applications` — Add new job application.
- `PATCH /api/v1/applications/:id` — Move stage (e.g. `wishlist` → `applied` → `interview`).
- `GET /api/v1/analytics/overview` — Aggregated metrics and historical score progressions.
