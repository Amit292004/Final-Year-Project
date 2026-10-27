import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

const isLiveSupabase = config.supabase.url && !config.supabase.url.includes('placeholder');

export const supabaseAdmin = isLiveSupabase
  ? createClient(config.supabase.url, config.supabase.secretKey, {
      auth: { persistSession: false }
    })
  : null;

export const createScopedUserClient = (token) => {
  if (!isLiveSupabase) return null;
  return createClient(config.supabase.url, config.supabase.publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: { persistSession: false }
  });
};

/**
 * Local in-memory store for development/testing when live Supabase is not connected.
 * Ensures seamless end-to-end functionality without hard crash.
 */
class LocalStore {
  constructor() {
    this.profiles = new Map();
    this.resumes = new Map();
    this.resumeVersions = new Map();
    this.assessments = new Map();
    this.jobs = new Map();
    this.matches = new Map();
    this.skills = new Map();
    this.gaps = new Map();
    this.roadmaps = new Map();
    this.roadmapTasks = new Map();
    this.interviews = new Map();
    this.interviewMessages = new Map();
    this.conversations = new Map();
    this.conversationMessages = new Map();
    this.applications = new Map();
    this.notifications = new Map();
  }
}

export const localStore = new LocalStore();
