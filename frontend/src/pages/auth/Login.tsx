import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import { GoogleButton } from '../../components/GoogleButton';
import logo from '../../assets/logo.jpeg';

export default function Login() {
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      const fallback = user.role === 'BRAND' ? '/brand' : user.role === 'INFLUENCER' ? '/influencer' : '/admin';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      setLoading(true);
      setError('');
      const result = await googleAuth(idToken);
      if ('isNewUser' in result && result.isNewUser) {
        navigate('/auth/google/finish', { state: result });
      } else {
        toast.success('Welcome back!');
        const user = result as any;
        const fallback = user.role === 'BRAND' ? '/brand' : user.role === 'INFLUENCER' ? '/influencer' : '/admin';
        navigate(location.state?.from || fallback, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Connectify" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold">Connectify</span>
        </Link>
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1.5 text-center text-sm text-ink/50">Log in to continue collaborating</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <div>
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-brand-purple hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-sm font-medium text-brand-pink">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Log in <FiArrowRight />
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2">
           <div className="h-px w-full bg-ink/10"></div>
           <span className="text-xs text-ink/50 uppercase">or</span>
           <div className="h-px w-full bg-ink/10"></div>
        </div>
        <GoogleButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message)} />

        <p className="mt-6 text-center text-sm text-ink/50">
          New to Connectify?{' '}
          <Link to="/register" className="font-semibold text-brand-purple hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
