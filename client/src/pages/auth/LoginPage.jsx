import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline font-extrabold text-2xl text-carbon text-center">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-textSecondary text-center">
          Access your resumes, matches, interview sessions, and roadmaps.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-btn bg-semanticErrorBg border border-red-200 text-semanticError text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="candidate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link to="/forgot-password" className="text-xs font-semibold text-signature hover:text-burnt">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-borderStandard text-xs text-textSecondary">
        Don't have an account yet?{' '}
        <Link to="/signup" className="font-bold text-signature hover:text-burnt">
          Create Account
        </Link>
      </div>
    </div>
  );
}
