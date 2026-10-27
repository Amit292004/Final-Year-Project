import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key',
    secretKey: process.env.SUPABASE_SECRET_KEY || 'placeholder-service-key'
  },
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
    token: process.env.AI_SERVICE_TOKEN || 'careerfit_ai_internal_secret_token_2026'
  }
};
