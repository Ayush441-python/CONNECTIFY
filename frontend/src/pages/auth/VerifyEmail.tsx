import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { authApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpeg';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const { refreshProfile, user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(async () => {
        setStatus('success');
        if (user) await refreshProfile();
      })
      .catch((err) => {
        setStatus('error');
        setError(extractErrorMessage(err));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const dashboardPath = user?.role === 'BRAND' ? '/brand' : user?.role === 'INFLUENCER' ? '/influencer' : '/login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card w-full max-w-md p-8 text-center">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Connectify" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold">Connectify</span>
        </Link>

        {status === 'loading' && (
          <>
            <FiLoader className="mx-auto mb-3 animate-spin text-4xl text-brand-purple" />
            <h1 className="font-display text-xl font-semibold text-ink">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="mx-auto mb-3 text-4xl text-emerald-500" />
            <h1 className="font-display text-xl font-semibold text-ink">Email verified!</h1>
            <p className="mt-2 text-sm text-ink/55">Your account is now fully verified.</p>
            <Link to={dashboardPath} className="btn-primary mt-6 inline-flex">
              {user ? 'Go to dashboard' : 'Log in'}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle className="mx-auto mb-3 text-4xl text-brand-pink" />
            <h1 className="font-display text-xl font-semibold text-ink">Verification failed</h1>
            <p className="mt-2 text-sm text-ink/55">{error || 'This link may have expired.'}</p>
            <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-brand-purple hover:underline">
              Back to login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
