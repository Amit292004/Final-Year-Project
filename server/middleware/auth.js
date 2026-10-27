import { supabaseAdmin, createScopedUserClient, localStore } from '../services/supabase.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Missing or malformed Authorization header. Bearer token required.' }
    });
  }

  const token = authHeader.split(' ')[1];

  // If live Supabase client exists, verify token with auth.getUser()
  if (supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid or expired authentication token.' }
        });
      }
      req.user = user;
      req.scopedClient = createScopedUserClient(token);
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token verification failed.', details: err.message }
      });
    }
  }

  // Development fallback for local testing when Supabase keys are placeholders
  req.user = {
    id: 'usr_demo_careerfit_001',
    email: 'candidate@careerfit.ai',
    user_metadata: { full_name: 'Demo Candidate' },
    role: 'candidate'
  };
  req.scopedClient = null;
  next();
};

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required.' }
    });
  }

  if (req.user.role === 'admin' || req.user.user_metadata?.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: { message: 'Forbidden. Administrator access required.' }
  });
};
