import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiInstagram, FiBookmark } from 'react-icons/fi';
import { Badge } from './ui';
import type { InfluencerProfile } from '../types';

const tierLabels: Record<string, string> = {
  NANO: 'Nano · 1K-10K',
  MICRO: 'Micro · 10K-100K',
  MACRO: 'Macro · 100K-1M',
  MEGA: 'Mega · 1M+',
};

interface CreatorCardProps {
  creator: InfluencerProfile;
  onSave?: () => void;
  saved?: boolean;
  aspect?: 'portrait' | 'square';
}

export function CreatorCard({ creator, onSave, saved, aspect = 'portrait' }: CreatorCardProps) {
  const cover = creator.portfolioImages?.[0]?.imageUrl || creator.featuredCoverUrl;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card group overflow-hidden"
    >
      <Link to={`/creator/${creator.username}`} className="block">
        <div className={`relative w-full overflow-hidden bg-mist ${aspect === 'portrait' ? 'aspect-[4/5]' : 'aspect-square'}`}>
          {cover ? (
            <img
              src={cover}
              alt={creator.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-gradient-soft font-display text-3xl text-brand-purple/30">
              {creator.name[0]}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent" />

          {onSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onSave();
              }}
              className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                saved ? 'bg-brand-gradient text-white' : 'bg-white/70 text-ink/60 hover:text-brand-pink'
              }`}
            >
              <FiBookmark size={14} className={saved ? 'fill-current' : ''} />
            </button>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            {creator.profilePhotoUrl ? (
              <img src={creator.profilePhotoUrl} className="h-8 w-8 rounded-full object-cover ring-2 ring-white" alt="" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-brand-purple ring-2 ring-white">
                {creator.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{creator.name}</p>
              <p className="truncate text-xs text-white/70">@{creator.username}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {creator.categories.slice(0, 2).map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
            <span className="text-[11px] font-medium text-ink/40">{tierLabels[creator.tier]}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-ink/45">
            {creator.city ? (
              <span className="flex items-center gap-1">
                <FiMapPin size={11} /> {creator.city}
              </span>
            ) : (
              <span />
            )}
            {creator.instagramUsername && (
              <span className="flex items-center gap-1">
                <FiInstagram size={11} /> {creator.instagramUsername}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
