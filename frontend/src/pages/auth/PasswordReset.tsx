import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { authApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { Button, Input } from '../../components/ui';
import logo from '../../assets/logo.jpeg';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Connectify" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold">Connectify</span>
        </Link>
        {children}
      </motion.div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Shell>
        <div className="text-center">
          <FiCheckCircle className="mx-auto mb-3 text-4xl text-brand-purple" />
          <h1 className="font-display text-xl font-semibold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink/55">If an account exists for {email}, a reset link is on its way.</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-brand-purple hover:underline">
            Back to login
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-center font-display text-2xl font-semibold text-ink">Forgot your password?</h1>
      <p className="mt-1.5 text-center text-sm text-ink/50">We'll email you a reset link</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Button type="submit" loading={loading} className="w-full">
          Send reset link <FiArrowRight />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/50">
        <Link to="/login" className="font-semibold text-brand-purple hover:underline">
          Back to login
        </Link>
      </p>
    </Shell>
  );
}

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset — please log in');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <h1 className="text-center font-display text-2xl font-semibold text-ink">Set a new password</h1>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <Input label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        {error && <p className="text-sm font-medium text-brand-pink">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Reset password <FiArrowRight />
        </Button>
      </form>
    </Shell>
  );
}
