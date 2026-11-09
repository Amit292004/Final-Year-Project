import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AnimateIn } from '../../components/ui/AnimateIn';
import { useAuth } from '../../contexts/AuthContext';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '' };
    if (password.length < 6) return { label: 'Weak (min 6 chars)', color: 'text-semanticError' };
    if (password.length < 10) return { label: 'Medium', color: 'text-semanticWarning' };
    return { label: 'Strong', color: 'text-semanticSuccess' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      setTimeout(() => navigate('/onboarding'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-semanticSuccessBg text-semanticSuccess flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-headline font-bold text-xl text-carbon">Account Created!</h3>
        <p className="text-xs text-textSecondary">
          Redirecting you to the candidate onboarding wizard...
        </p>
      </div>
    );
  }

  return (
    <AnimateIn delay={0} className="space-y-6">
      <div>
        <h2 className="font-headline font-black text-2xl text-carbon text-center">
          Create Free Account
        </h2>
        <p className="mt-1 text-xs text-textSecondary text-center">
          Access deterministic ATS scoring, job matching, and interview practice.
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
          label="Full Name"
          type="text"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={User}
          required
        />

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
          {password && (
            <p className={`text-[11px] font-semibold mt-1 ${strength.color}`}>
              Strength: {strength.label}
            </p>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={Lock}
          required
        />

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 rounded border-borderStrong text-signature focus:ring-signature"
          />
          <label htmlFor="terms" className="text-xs text-textSecondary leading-snug">
            I agree to the <span className="font-semibold text-carbon">Terms of Service</span> and acknowledge the{' '}
            <span className="font-semibold text-carbon">Privacy Policy</span>.
          </label>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-borderStandard text-xs text-textSecondary">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-signature hover:text-burnt">
          Sign In
        </Link>
      </div>
    </AnimateIn>
  );
}
