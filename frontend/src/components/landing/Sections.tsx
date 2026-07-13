import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiLayers,
  FiMessageSquare,
  FiShield,
  FiTrendingUp,
  FiZap,
  FiChevronDown,
  FiArrowRight,
} from 'react-icons/fi';
import { CATEGORIES } from '../../constants';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-purple">{eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-ink/55">{description}</p>}
      </div>
    </Reveal>
  );
}

// ==================== Features ====================

const features = [
  {
    icon: FiSearch,
    title: 'Discover, not scroll',
    desc: 'A masonry-style Discover feed surfaces creators by category, tier, and location — built for browsing, not searching blind.',
  },
  {
    icon: FiLayers,
    title: 'Structured campaigns',
    desc: 'Deliverables, moodboards, and budgets live in one campaign brief, so applications come in ready to compare.',
  },
  {
    icon: FiMessageSquare,
    title: 'Real-time workspace',
    desc: 'Once a collaboration starts, chat, files, and deadlines all sit in a dedicated workspace — not a scattered DM thread.',
  },
  {
    icon: FiShield,
    title: 'Verified & moderated',
    desc: 'Email verification, admin moderation, and reporting keep the marketplace trustworthy for both sides.',
  },
  {
    icon: FiTrendingUp,
    title: 'Built for every tier',
    desc: 'From nano creators to macro influencers — filter and match by audience size, not just follower count.',
  },
  {
    icon: FiZap,
    title: 'Fast, focused UI',
    desc: 'Lazy loading, skeleton states, and optimistic updates keep the whole platform feeling instant.',
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="Why Connectify"
        title="Everything a collaboration needs, in one place"
        description="Not a social feed. A working marketplace for brands and creators to find each other and get things done."
      />
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <div className="glass-card h-full p-6 transition-all duration-300 hover:shadow-glass-lg hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <f.icon size={19} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ==================== How It Works ====================

const steps = [
  { n: '01', title: 'Create your profile', desc: 'Brands set up a company profile; creators build a portfolio with tier, categories, and languages.' },
  { n: '02', title: 'Discover & apply', desc: 'Brands browse Discover or post a campaign. Creators browse campaigns or get invited directly.' },
  { n: '03', title: 'Accept & collaborate', desc: 'Once accepted, a shared workspace opens automatically — chat, files, deliverables, deadline.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mist/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="How it works" title="From profile to collaboration in three steps" />
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative">
                <span className="font-display text-6xl font-semibold text-brand-purple/10">{s.n}</span>
                <h3 className="-mt-4 font-display text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/55">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute right-[-1.25rem] top-8 hidden text-brand-purple/25 md:block">
                    <FiArrowRight size={20} />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Categories ====================

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading eyebrow="Browse by niche" title="Every category, covered" />
      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-medium text-ink/70 transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-brand-gradient hover:text-white hover:shadow-glow"
            >
              {c}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}


// ==================== FAQ ====================

const faqs = [
  { q: 'Is Connectify free to join?', a: 'Yes — creating a brand or creator profile, browsing, and applying to campaigns is free to start.' },
  { q: 'How is this different from Instagram DMs?', a: 'Every collaboration gets a structured workspace with deliverables, files, and a deadline — instead of a thread that gets lost.' },
  { q: 'Can I be both a brand and a creator?', a: 'Each account has one role today. You can create a second account with a different email for the other role.' },
  { q: 'How do payments work?', a: 'Connectify handles discovery, applications, and collaboration workflow. Payment terms are agreed directly between brand and creator.' },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading eyebrow="FAQ" title="Common questions" />
      <div className="mt-12 space-y-3">
        {faqs.map((f, i) => {
          const open = openIdx === i;
          return (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-ink">{f.q}</span>
                  <FiChevronDown className={`shrink-0 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/55">{f.a}</p>}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ==================== CTA ====================

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl2 bg-brand-gradient px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Ready to collaborate?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Join as a brand looking for the right creators, or a creator ready to be discovered.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-purple transition-transform hover:scale-[1.02]">
              Join as a Creator <FiArrowRight />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/10">
              Join as a Brand <FiArrowRight />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
