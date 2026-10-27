import axios from 'axios';
import { config } from '../config/index.js';

const client = axios.create({
  baseURL: config.aiService.url,
  headers: {
    'X-Service-Token': config.aiService.token
  },
  timeout: 30000
});

export const aiClient = {
  async health() {
    const res = await client.get('/health');
    return res.data;
  },

  async parseResume(fileBuffer, filename) {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fileBuffer, filename);

    const res = await client.post('/api/v1/parse-resume', form, {
      headers: form.getHeaders()
    });
    return res.data;
  },

  async scoreResume({ resumeText, parsedData, targetRole, jobDescription }) {
    const res = await client.post('/api/v1/score-resume', {
      resume_text: resumeText,
      parsed_data: parsedData,
      target_role: targetRole,
      job_description: jobDescription
    });
    return res.data;
  },

  async extractSkills(text) {
    const res = await client.post('/api/v1/extract-skills', { text });
    return res.data;
  },

  async matchJob({ resumeText, jobDescription, parsedResume, jobTitle, company }) {
    const res = await client.post('/api/v1/match-jd', {
      resume_text: resumeText,
      job_description: jobDescription,
      parsed_resume: parsedResume,
      job_title: jobTitle,
      company
    });
    return res.data;
  },

  async generateFeedback({ resumeText, targetRole, jobDescription }) {
    const res = await client.post('/api/v1/generate-feedback', {
      resume_text: resumeText,
      target_role: targetRole,
      job_description: jobDescription
    });
    return res.data;
  },

  async generateQuestions({ targetRole, difficulty, questionCount, resumeText, jobDescription }) {
    const res = await client.post('/api/v1/interview/generate-questions', {
      target_role: targetRole,
      difficulty,
      question_count: questionCount || 5,
      resume_text: resumeText,
      job_description: jobDescription
    });
    return res.data;
  },

  async evaluateAnswer({ question, questionType, difficulty, userAnswer, targetRole, expectedTopics }) {
    const res = await client.post('/api/v1/interview/evaluate-answer', {
      question,
      question_type: questionType,
      difficulty,
      user_answer: userAnswer,
      target_role: targetRole,
      expected_topics: expectedTopics || []
    });
    return res.data;
  },

  async advisorChat({ message, targetRole, skills, contextChunks }) {
    const res = await client.post('/api/v1/interview/advisor-chat', {
      message,
      target_role: targetRole,
      skills,
      context_chunks: contextChunks || []
    });
    return res.data;
  },

  async generateRoadmap({ targetRole, missingSkills, weeklyHours }) {
    const res = await client.post('/api/v1/interview/generate-roadmap', {
      target_role: targetRole,
      missing_skills: missingSkills,
      weekly_hours: weeklyHours
    });
    return res.data;
  },

  async generateReportHtml({ assessmentData, candidateName, targetRole }) {
    const res = await client.post('/api/v1/generate-report', {
      assessment_data: assessmentData,
      candidate_name: candidateName,
      target_role: targetRole
    });
    return res.data;
  }
};
