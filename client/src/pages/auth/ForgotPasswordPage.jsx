import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // Always display confirmation for user privacy
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-peach text-burnt flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-headline font-bold text-xl text-carbon">Reset Link Sent</h3>
        <p className="text-xs text-textSecondary max-w-sm mx-auto leading-relaxed">
          If an account exists for <span className="font-semibold text-carbon">{email}</span>, you will receive password recovery instructions shortly.
        </p>
        <div className="pt-4">
          <Link to="/login">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline font-extrabold text-2xl text-carbon text-center">
          Reset Your Password
        </h2>
        <p className="mt-1 text-xs text-textSecondary text-center">
          Enter your email to receive recovery instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Email"
          type="email"
          placeholder="candidate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Send Recovery Email
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-carbon">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
