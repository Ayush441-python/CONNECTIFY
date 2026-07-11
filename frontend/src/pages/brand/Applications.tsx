import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiX, FiUsers } from 'react-icons/fi';
import { campaignApi, applicationApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Avatar, Badge, Button, EmptyState, ErrorState, GlassCard, ListSkeleton, Skeleton, statusTone } from '../../components/ui';
import type { Campaign, CampaignApplication } from '../../types';

const STATUS_TABS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const;

export default function BrandApplications() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaign = useAsync(async () => (await campaignApi.getById(campaignId!)).data.data as Campaign, [campaignId]);
  const applications = useAsync(async () => (await campaignApi.applications(campaignId!)).data.data as CampaignApplication[], [campaignId]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('ALL');
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (applications.data || []).filter((a) => statusFilter === 'ALL' || a.status === statusFilter),
    [applications.data, statusFilter]
  );

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      await applicationApi.accept(id);
      toast.success('Application accepted — workspace created!');
      applications.setData((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status: 'ACCEPTED' } : a)) : prev));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      await applicationApi.reject(id);
      toast.success('Application rejected');
      applications.setData((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a)) : prev));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/brand/campaigns" className="flex w-fit items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <FiArrowLeft size={14} /> Back to campaigns
      </Link>

      <div>
        {campaign.loading ? <Skeleton className="h-8 w-64" /> : <h1 className="font-display text-2xl font-semibold text-ink">{campaign.data?.title}</h1>}
        <p className="mt-1 text-sm text-ink/50">
          {applications.data?.length || 0} applicant{applications.data?.length === 1 ? '' : 's'}
        </p>
      </div>

      {!applications.loading && !applications.error && applications.data && applications.data.length > 0 && (
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

      {applications.loading ? (
        <ListSkeleton rows={4} />
      ) : applications.error ? (
        <ErrorState message={applications.error} onRetry={applications.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiUsers />}
          title={applications.data?.length ? 'No applications match this filter' : 'No applications yet'}
          description={applications.data?.length ? undefined : 'Applications will appear here as creators apply.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <GlassCard key={a.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-1 gap-3">
                  <Avatar src={a.influencer?.profilePhotoUrl} name={a.influencer?.name || '?'} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/creator/${a.influencer?.username}`} className="font-display text-base font-semibold text-ink hover:text-brand-purple">
                        {a.influencer?.name}
                      </Link>
                      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                    </div>
                    <p className="text-xs text-ink/40">
                      @{a.influencer?.username} · {a.influencer?.tier} · {a.influencer?.city || 'Location not set'}
                    </p>
                    <p className="mt-2 text-sm text-ink/60">"{a.message}"</p>
                    {a.influencer?.portfolioImages && a.influencer.portfolioImages.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {a.influencer.portfolioImages.slice(0, 3).map((img) => (
                          <img key={img.id} src={img.imageUrl} className="h-14 w-14 rounded-lg object-cover" alt="" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {a.expectedPrice && <p className="mb-2 font-display text-lg font-semibold text-brand-purple">₹{a.expectedPrice.toLocaleString()}</p>}
                  {a.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button className="!py-2 text-xs" icon={<FiCheck size={13} />} loading={actingId === a.id} onClick={() => handleAccept(a.id)}>
                        Accept
                      </Button>
                      <Button variant="secondary" className="!py-2 text-xs" icon={<FiX size={13} />} onClick={() => handleReject(a.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
