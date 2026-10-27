import re
import json
import httpx
from typing import List, Dict, Any, Optional
from backend.core.config import settings
from backend.core.logging import logger
from backend.schemas.interview import (
    QuestionItem, GenerateQuestionsRequest,
    AnswerEvaluationRequest, AnswerEvaluationResult, StarAlignment
)

class InterviewService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_interview_questions(self, req: GenerateQuestionsRequest) -> List[QuestionItem]:
        """
        Generates role-tailored interview questions using LLM or structured curriculum fallback.
        """
        if self.api_key:
            try:
                questions = await self._generate_llm_questions(req)
                if questions:
                    return questions
            except Exception as e:
                logger.error(f"Error generating interview questions via LLM: {e}. Falling back to curriculum.")

        return self._generate_fallback_questions(req)

    async def _generate_llm_questions(self, req: GenerateQuestionsRequest) -> Optional[List[QuestionItem]]:
        prompt = (
            f"Generate {req.question_count} structured interview questions for a {req.difficulty}-level {req.target_role}.\n"
            "Include:\n"
            "- 1 Background / Introduction question\n"
            "- 2 Deep technical questions assessing core competencies\n"
            "- 1 Skill-gap / Architectural problem-solving challenge\n"
            "- 1 Behavioral question (expecting STAR method response)\n"
            "Return valid JSON array of objects:\n"
            "[\n"
            "  {\n"
            '    "order": 1,\n'
            '    "question": "string",\n'
            '    "type": "background" | "technical" | "skill_gap" | "behavioral",\n'
            '    "difficulty": "string",\n'
            '    "target_skill": "string",\n'
            '    "expected_topics": ["string"],\n'
            '    "hint": "string"\n'
            "  }\n"
            "]"
        )

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                self.base_url,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a lead technical interviewer at a top technology company."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
            )
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                # Extract json array
                m = re.search(r'\[.*\]', raw, re.DOTALL)
                if m:
                    data = json.loads(m.group(0))
                    return [QuestionItem(**item) for item in data[:req.question_count]]
        return None

    def _generate_fallback_questions(self, req: GenerateQuestionsRequest) -> List[QuestionItem]:
        role = req.target_role
        diff = req.difficulty

        return [
            QuestionItem(
                order=1,
                question=f"Can you walk me through your background as a {role}, highlighting a recent complex technical project you engineered end-to-end?",
                type="background",
                difficulty=diff,
                target_skill="Communication & Architecture",
                expected_topics=["Project overview", "Tech stack selection", "Key contribution", "Measurable outcome"],
                hint="Frame your response in 2-3 minutes: situation context, specific technical choices, and business value achieved."
            ),
            QuestionItem(
                order=2,
                question=f"In high-traffic systems, how do you manage database bottlenecks, connection pooling, and indexing strategies to maintain sub-100ms response times?",
                type="technical",
                difficulty=diff,
                target_skill="Database Optimization",
                expected_topics=["B-Tree indexes", "Connection pool limits", "Read replicas", "Caching layers", "Query execution plans"],
                hint="Discuss EXPLAIN ANALYZE, query indexing, and caching patterns like Redis write-through/cache-aside."
            ),
            QuestionItem(
                order=3,
                question=f"Explain how you design a resilient RESTful or GraphQL API. How do you handle idempotency, rate limiting, and centralized error handling?",
                type="technical",
                difficulty=diff,
                target_skill="API Architecture",
                expected_topics=["HTTP status codes", "Token bucket / Leaky bucket", "Idempotency keys", "Middleware error pipeline"],
                hint="Mention distributed locks, header tokens, and semantic error codes."
            ),
            QuestionItem(
                order=4,
                question="Imagine an unpredicted traffic spike causes memory exhaustion and service restarts on your primary service. How do you diagnose and mitigate this under pressure?",
                type="skill_gap",
                difficulty=diff,
                target_skill="Distributed Troubleshooting",
                expected_topics=["Metrics & APM tracing", "Heap dump analysis", "Graceful degradation", "Backpressure / Circuit breakers"],
                hint="Outline a step-by-step incident response playbook: stabilize, identify root cause, implement mitigation."
            ),
            QuestionItem(
                order=5,
                question="Describe a situation where you had a strong technical disagreement with a team member or stakeholder regarding system architecture. How did you resolve it?",
                type="behavioral",
                difficulty=diff,
                target_skill="Collaboration & Leadership",
                expected_topics=["Situation", "Task", "Action", "Result", "Objective data vs opinion"],
                hint="Use the STAR method: clearly articulate the Situation, Task, Action taken with empathy, and the team Result."
            )
        ]

    async def evaluate_interview_answer(self, req: AnswerEvaluationRequest) -> AnswerEvaluationResult:
        """
        Evaluates a candidate's answer for technical depth, clarity, and STAR structure.
        """
        ans = req.user_answer.strip()
        word_count = len(ans.split())

        # If answer is too short
        if word_count < 15:
            return AnswerEvaluationResult(
                technical_depth=3.0,
                communication_clarity=4.0,
                relevance=3.0,
                structure=3.0,
                star_alignment=StarAlignment(situation=False, task=False, action=False, result=False, feedback="Answer is too brief to evaluate properly."),
                key_strengths=["Provided an initial response."],
                areas_for_improvement=["Provide concrete examples, technical mechanisms, and detailed explanations."],
                model_answer_suggestion="Elaborate with specific frameworks, real-world examples, and measurable impacts.",
                summary_feedback="Your response was very brief. In technical interviews, provide context, your specific technical reasoning, and the impact of your decisions."
            )

        # Behavioral STAR check
        is_behavioral = req.question_type == "behavioral"
        ans_lower = ans.lower()
        has_sit = any(w in ans_lower for w in ['when', 'at company', 'project', 'situation', 'client', 'we were'])
        has_task = any(w in ans_lower for w in ['task', 'goal', 'objective', 'responsible for', 'needed to'])
        has_act = any(w in ans_lower for w in ['i decided', 'i implemented', 'i proposed', 'i built', 'i spoke', 'i resolved', 'action'])
        has_res = any(w in ans_lower for w in ['result', 'outcome', 'finally', 'improved', 'learned', 'delivered', 'achieved', 'successfully'])

        star = None
        if is_behavioral:
            star = StarAlignment(
                situation=has_sit,
                task=has_task,
                action=has_act,
                result=has_res,
                feedback="Strong STAR coverage." if (has_sit and has_act and has_res) else "Remember to clearly specify the Result and your individual Action."
            )

        # Technical depth calculation
        tech_terms = ['api', 'database', 'cache', 'query', 'latency', 'scale', 'async', 'index', 'concurrency', 'docker', 'test', 'error', 'metric']
        found_tech = sum(1 for t in tech_terms if t in ans_lower)
        
        tech_score = min(9.5, max(4.0, 5.0 + (found_tech * 0.7) + (0.5 if word_count > 80 else 0)))
        clarity_score = min(9.5, max(5.0, 6.0 + (1.5 if 60 <= word_count <= 250 else 0.5)))
        relevance_score = min(9.0, max(5.0, 7.0 + (1.0 if any(topic.lower() in ans_lower for topic in req.expected_topics) else 0)))
        structure_score = 8.5 if (is_behavioral and has_sit and has_act and has_res) or (not is_behavioral and word_count >= 50) else 6.0

        strengths = []
        improvements = []

        if word_count >= 60:
            strengths.append("Thorough and well-developed response with substantial context.")
        if found_tech >= 3:
            strengths.append("Incorporated precise engineering terminology and domain concepts.")
        if is_behavioral and has_res:
            strengths.append("Concluded with the outcome and business/team takeaway.")

        if not strengths:
            strengths.append("Directly addressed the question asked.")

        if found_tech < 2 and not is_behavioral:
            improvements.append("Include specific architectural patterns, tool names, or code-level mechanisms.")
        if is_behavioral and not has_res:
            improvements.append("Ensure you end with quantifiable results or lessons learned (The 'R' in STAR).")
        if word_count < 50:
            improvements.append("Expand on trade-offs and alternative approaches considered.")

        return AnswerEvaluationResult(
            technical_depth=round(tech_score, 1),
            communication_clarity=round(clarity_score, 1),
            relevance=round(relevance_score, 1),
            structure=round(structure_score, 1),
            star_alignment=star,
            key_strengths=strengths,
            areas_for_improvement=improvements,
            model_answer_suggestion=(
                "A top-percentile response balances technical precision with strategic perspective: "
                "State your direct approach, detail the architectural mechanics and trade-offs, and conclude with the business outcome."
            ),
            summary_feedback=(
                f"Solid effort! Technical depth scored {round(tech_score, 1)}/10, communication clarity {round(clarity_score, 1)}/10. "
                "Structuring answers systematically with trade-offs demonstrates senior engineering maturity."
            )
        )

interview_service = InterviewService()
