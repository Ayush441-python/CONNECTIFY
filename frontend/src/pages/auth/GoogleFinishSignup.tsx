import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowRight, FiArrowLeft, FiBriefcase, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Button, ChipSelect, Input, Select, TextArea } from '../../components/ui';
import { CATEGORIES, LANGUAGES, TIERS } from '../../constants';
import logo from '../../assets/logo.jpeg';

type Role = 'INFLUENCER' | 'BRAND';

interface InfluencerForm {
  name: string;
  username: string;
  mobile?: string;
  instagramUsername?: string;
  city?: string;
  state?: string;
  country?: string;
  tier: string;
}

interface BrandForm {
  brandName: string;
  mobile?: string;
  industry?: string;
  website?: string;
  about?: string;
  city?: string;
  state?: string;
  country?: string;
}

export default function GoogleFinishSignup() {
  const { state } = useLocation();
  const { googleRegisterInfluencer, googleRegisterBrand } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(state?.role || null);
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const suggested = state?.suggested || {};
  const signupToken = state?.signupToken;

  const influencerFormHook = useForm<InfluencerForm>({
    defaultValues: { name: suggested.name || '', tier: 'NANO' },
  });
  const brandFormHook = useForm<BrandForm>({
    defaultValues: { brandName: suggested.name || '' },
  });

  if (!signupToken) {
    return <Navigate to="/register" replace />;
  }

  const onInfluencerSubmit = async (data: InfluencerForm) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await googleRegisterInfluencer({ ...data, categories, languages, availability: 'AVAILABLE', signupToken });
      toast.success('Account created — welcome to Connectify!');
      navigate('/influencer', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onBrandSubmit = async (data: BrandForm) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await googleRegisterBrand({ ...data, preferredCategories: categories, signupToken });
      toast.success('Account created — welcome to Connectify!');
      navigate('/brand', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

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

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div key="role" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h1 className="text-center font-display text-2xl font-semibold text-ink">Almost there</h1>
              <p className="mt-1.5 text-center text-sm text-ink/50">Choose how you'll use Connectify</p>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setRole('BRAND')}
                  className="group rounded-xl2 border border-ink/10 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-glass-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                    <FiBriefcase size={19} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">Brand</h3>
                  <p className="mt-1.5 text-sm text-ink/50">Discover creators and run campaigns.</p>
                </button>

                <button
                  onClick={() => setRole('INFLUENCER')}
                  className="group rounded-xl2 border border-ink/10 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-glass-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                    <FiUser size={19} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">Influencer</h3>
                  <p className="mt-1.5 text-sm text-ink/50">Build a portfolio and get discovered.</p>
                </button>
              </div>
            </motion.div>
          ) : role === 'INFLUENCER' ? (
            <motion.div key="influencer" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {!state?.role && (
                <button onClick={() => setRole(null)} className="mb-4 flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <h1 className="font-display text-xl font-semibold text-ink">Complete your creator profile</h1>
              <p className="mt-1 text-sm text-ink/60">Signed in as {suggested.email}</p>

              <form onSubmit={influencerFormHook.handleSubmit(onInfluencerSubmit)} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full name" placeholder="Meera Kapoor" error={influencerFormHook.formState.errors.name?.message} {...influencerFormHook.register('name', { required: 'Required' })} />
                  <Input label="Username" placeholder="meera.styles" error={influencerFormHook.formState.errors.username?.message} {...influencerFormHook.register('username', { required: 'Required', pattern: { value: /^[a-zA-Z0-9_.]+$/, message: 'Letters, numbers, _ and . only' } })} />
                </div>
                <Input label="Mobile (optional)" placeholder="+91 98765 43210" {...influencerFormHook.register('mobile')} />
                <Input label="Instagram username (optional)" placeholder="@meera.styles" {...influencerFormHook.register('instagramUsername')} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City" {...influencerFormHook.register('city')} />
                  <Input label="State" {...influencerFormHook.register('state')} />
                  <Input label="Country" {...influencerFormHook.register('country')} />
                </div>
                <Select label="Influencer tier" {...influencerFormHook.register('tier')}>
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <ChipSelect label="Categories" options={CATEGORIES} value={categories} onChange={setCategories} />
                <ChipSelect label="Languages" options={LANGUAGES} value={languages} onChange={setLanguages} />

                {submitError && <p className="text-sm font-medium text-brand-pink">{submitError}</p>}
                <Button type="submit" loading={submitting} className="w-full">
                  Create account <FiArrowRight />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="brand" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {!state?.role && (
                <button onClick={() => setRole(null)} className="mb-4 flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <h1 className="font-display text-xl font-semibold text-ink">Complete your brand profile</h1>
              <p className="mt-1 text-sm text-ink/60">Signed in as {suggested.email}</p>

              <form onSubmit={brandFormHook.handleSubmit(onBrandSubmit)} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Brand name" placeholder="Studio Bloom" error={brandFormHook.formState.errors.brandName?.message} {...brandFormHook.register('brandName', { required: 'Required' })} />
                  <Input label="Industry (optional)" placeholder="Fashion & Apparel" {...brandFormHook.register('industry')} />
                </div>
                <Input label="Mobile (optional)" placeholder="+91 98765 43210" {...brandFormHook.register('mobile')} />
                <Input label="Website (optional)" placeholder="https://yourbrand.com" {...brandFormHook.register('website')} />
                <TextArea label="About (optional)" placeholder="A short line about your brand" {...brandFormHook.register('about')} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City" {...brandFormHook.register('city')} />
                  <Input label="State" {...brandFormHook.register('state')} />
                  <Input label="Country" {...brandFormHook.register('country')} />
                </div>
                <ChipSelect label="Preferred categories" options={CATEGORIES} value={categories} onChange={setCategories} />

                {submitError && <p className="text-sm font-medium text-brand-pink">{submitError}</p>}
                <Button type="submit" loading={submitting} className="w-full">
                  Create account <FiArrowRight />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
