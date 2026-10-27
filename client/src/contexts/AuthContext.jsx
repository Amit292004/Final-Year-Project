import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('careerfit_token', session.access_token);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('careerfit_token', session.access_token);
        } else {
          setUser(null);
          localStorage.removeItem('careerfit_token');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local/demo auth fallback
      const savedUser = localStorage.getItem('careerfit_demo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Auto sign-in demo candidate
        const defaultUser = {
          id: 'usr_demo_careerfit_001',
          email: 'candidate@careerfit.ai',
          user_metadata: { full_name: 'Alex Rivera' },
          role: 'candidate'
        };
        setUser(defaultUser);
        localStorage.setItem('careerfit_demo_user', JSON.stringify(defaultUser));
        localStorage.setItem('careerfit_token', 'demo_jwt_token_2026');
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      const dummyUser = {
        id: 'usr_demo_careerfit_001',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        role: 'candidate'
      };
      setUser(dummyUser);
      localStorage.setItem('careerfit_demo_user', JSON.stringify(dummyUser));
      localStorage.setItem('careerfit_token', 'demo_jwt_token_2026');
      return { user: dummyUser };
    }
  };

  const signUp = async (email, password, fullName) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      return data;
    } else {
      const newUser = {
        id: 'usr_' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
        role: 'candidate'
      };
      setUser(newUser);
      localStorage.setItem('careerfit_demo_user', JSON.stringify(newUser));
      localStorage.setItem('careerfit_token', 'demo_jwt_token_2026');
      return { user: newUser };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('careerfit_demo_user');
    localStorage.removeItem('careerfit_token');
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
