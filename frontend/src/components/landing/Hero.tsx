import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const floatingCards = [
  { top: '4%', left: '54%', rotate: -6, delay: 0, tag: 'Fashion', name: '@meera.styles', tier: 'Micro' },
  { top: '32%', left: '76%', rotate: 4, delay: 0.6, tag: 'Travel', name: '@arjun.wanders', tier: 'Macro' },
  { top: '58%', left: '52%', rotate: -3, delay: 1.2, tag: 'Food', name: '@zoya.eats', tier: 'Nano' },
  { top: '4%', left: '8%', rotate: 5, delay: 0.3, tag: 'Tech', name: '@dev.rohan', tier: 'Micro' },
  { top: '62%', left: '4%', rotate: 3, delay: 0.9, tag: 'Fitness', name: '@fit.kavya', tier: 'Macro' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-radial-fade pb-20 pt-14 sm:pt-20 lg:pb-32 lg:pt-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="pill mb-6 w-fit border-brand-purple/15 bg-brand-gradient-soft text-brand-purple-dark">
            <FiCheck className="mr-1.5" /> The creator collaboration marketplace
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]">
            Where brands find <span className="brand-text-gradient italic">creators</span>,
            <br /> not just followers.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink/55">
            Connectify pairs brands with the right creators through real portfolios, structured campaigns, and a
            shared workspace — no DMs lost in the void.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-primary !px-7 !py-3.5 text-base">
              Start collaborating <FiArrowRight />
            </Link>
            <a href="#how-it-works" className="btn-secondary !px-7 !py-3.5 text-base">
              See how it works
            </a>
          </div>

        </motion.div>

        <div className="relative hidden h-[480px] lg:block">
          {floatingCards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: c.delay }}
              className="absolute w-40 animate-float"
              style={{ top: c.top, left: c.left, animationDelay: `${c.delay}s`, transform: `rotate(${c.rotate}deg)` }}
            >
              <div className="glass-card overflow-hidden bg-white/80">
                <div className="flex h-24 items-center justify-center bg-brand-gradient-soft font-display text-lg text-brand-purple/40">
                  {c.tag}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-ink">{c.name}</p>
                  <p className="text-[10px] text-ink/40">{c.tier} · {c.tag}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="absolute inset-0 -z-10 rounded-full bg-brand-gradient-soft blur-3xl" />
        </div>
      </div>
    </section>
  );
}
