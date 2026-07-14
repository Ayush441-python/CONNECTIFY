import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUser } from 'react-icons/fi';
import GoogleAuthButton from '../../components/GoogleButton';
import logo from '../../assets/logo.jpeg';

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-xl p-8"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Connectify" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold">Connectify</span>
        </Link>

        <h1 className="text-center font-display text-2xl font-semibold text-ink">Join as</h1>
        <p className="mt-1.5 text-center text-sm text-ink/50">Choose how you'll use Connectify</p>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="group rounded-xl2 border border-ink/10 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-glass-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <FiBriefcase size={19} />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Brand</h3>
            <p className="mt-1.5 text-sm text-ink/50 mb-6">Discover creators and run campaigns.</p>
            
            <div className="flex w-full justify-center">
              <GoogleAuthButton role="BRAND" />
            </div>
          </div>

          <div className="group rounded-xl2 border border-ink/10 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-glass-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <FiUser size={19} />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Influencer</h3>
            <p className="mt-1.5 text-sm text-ink/50 mb-6">Build a portfolio and get discovered.</p>
            
            <div className="flex w-full justify-center">
              <GoogleAuthButton role="INFLUENCER" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-purple hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
