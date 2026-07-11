import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import { Badge, statusTone } from './ui';
import type { Campaign } from '../types';

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Budget on request';
  if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
  return `₹${(min || max)?.toLocaleString()}`;
}

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Deadline passed';
  if (diff === 0) return 'Due today';
  return `${diff} day${diff === 1 ? '' : 's'} left`;
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const dl = daysLeft(campaign.deadline);
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/campaign/${campaign.id}`} className="glass-card block overflow-hidden">
        <div className="relative h-36 w-full overflow-hidden bg-brand-gradient-soft">
          {campaign.moodboardImages?.[0] ? (
            <img src={campaign.moodboardImages[0].imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-2xl text-brand-purple/30">
              {campaign.brand?.brandName?.[0] || campaign.title[0]}
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            {campaign.brand?.logoUrl ? (
              <img src={campaign.brand.logoUrl} className="h-6 w-6 rounded-full object-cover" alt="" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mist text-[10px] font-bold text-ink/50">
                {campaign.brand?.brandName?.[0] || '?'}
              </div>
            )}
            <span className="text-xs font-medium text-ink/50">{campaign.brand?.brandName}</span>
          </div>

          <h3 className="line-clamp-1 font-display text-base font-semibold text-ink">{campaign.title}</h3>
          <p className="line-clamp-2 text-sm text-ink/50">{campaign.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-ink/45">
            <span className="font-semibold text-brand-purple">{formatBudget(campaign.budgetMin, campaign.budgetMax)}</span>
            {campaign.location && (
              <span className="flex items-center gap-1">
                <FiMapPin size={11} /> {campaign.location}
              </span>
            )}
            {dl && (
              <span className="flex items-center gap-1">
                <FiClock size={11} /> {dl}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiUsers size={11} /> {campaign.creatorsNeeded} needed
            </span>
          </div>

          <Badge>{campaign.category}</Badge>
        </div>
      </Link>
    </motion.div>
  );
}
