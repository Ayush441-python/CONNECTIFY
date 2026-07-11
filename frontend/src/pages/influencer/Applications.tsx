import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { applicationApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Badge, EmptyState, ErrorState, GlassCard, ListSkeleton, statusTone } from '../../components/ui';
import type { CampaignApplication } from '../../types';

const STATUS_TABS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const;

export default function Applications() {
  const { data: applications, loading, error, reload } = useAsync(async () => (await applicationApi.mine()).data.data as CampaignApplication[]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('ALL');

  const filtered = useMemo(
    () => (applications || []).filter((a) => statusFilter === 'ALL' || a.status === statusFilter),
    [applications, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My applications</h1>
        <p className="mt-1 text-sm text-ink/50">Track the status of campaigns you've applied to.</p>
      </div>

      {!loading && !error && applications && applications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-brand-gradient text-white shadow-glow' : 'border border-ink/10 bg-white text-ink/60'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiSend />}
          title={applications?.length ? 'No applications match this filter' : 'No applications yet'}
          description={applications?.length ? undefined : "Browse campaigns and apply to the ones that fit your niche."}
          action={
            !applications?.length ? (
              <Link to="/influencer/campaigns" className="btn-primary">
                Browse campaigns
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <GlassCard key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link to={`/campaign/${a.campaignId}`} className="truncate font-display text-base font-semibold text-ink hover:text-brand-purple">
                  {a.campaign?.title}
                </Link>
                <p className="mt-0.5 text-sm text-ink/50">{a.campaign?.brand?.brandName}</p>
                <p className="mt-1.5 line-clamp-1 text-xs text-ink/40">"{a.message}"</p>
              </div>
              <div className="flex items-center gap-4">
                {a.expectedPrice && <span className="text-sm font-semibold text-brand-purple">₹{a.expectedPrice.toLocaleString()}</span>}
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
