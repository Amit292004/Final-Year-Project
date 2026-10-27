import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardLimiter } from './middleware/rateLimit.js';

import healthRoutes from './routes/health.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import assessmentRoutes from './routes/assessment.js';
import matchingRoutes from './routes/matching.js';
import skillsRoutes from './routes/skills.js';
import roadmapRoutes from './routes/roadmap.js';
import interviewRoutes from './routes/interview.js';
import advisorRoutes from './routes/advisor.js';
import applicationsRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';
import notificationsRoutes from './routes/notifications.js';
import billingRoutes from './routes/billing.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(standardLimiter);

// Health route
app.use('/', healthRoutes);

// Versioned API routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/profiles`, profileRoutes);
app.use(`${API_PREFIX}/resumes`, resumeRoutes);
app.use(`${API_PREFIX}/assessments`, assessmentRoutes);
app.use(`${API_PREFIX}/jobs`, matchingRoutes);
app.use(`${API_PREFIX}/job-matches`, matchingRoutes);
app.use(`${API_PREFIX}/skills`, skillsRoutes);
app.use(`${API_PREFIX}/skill-gaps`, skillsRoutes);
app.use(`${API_PREFIX}/roadmaps`, roadmapRoutes);
app.use(`${API_PREFIX}/roadmap-tasks`, roadmapRoutes);
app.use(`${API_PREFIX}/interviews`, interviewRoutes);
app.use(`${API_PREFIX}/advisor`, advisorRoutes);
app.use(`${API_PREFIX}/applications`, applicationsRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${API_PREFIX}/billing`, billingRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
});

import { fileURLToPath } from 'url';

// Centralized error handler
app.use(errorHandler);

const PORT = config.port;

// Only start listening if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`[Express Gateway] CareerFit AI Gateway running on port ${PORT}`);
    console.log(`[Express Gateway] AI Service URL configured at: ${config.aiService.url}`);
  });
}

export default app;
