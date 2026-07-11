import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiInbox, FiCheck, FiX } from 'react-icons/fi';
import { requestApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Badge, Button, EmptyState, ErrorState, GlassCard, ListSkeleton, statusTone } from '../../components/ui';
import type { CollaborationRequestItem } from '../../types';

const STATUS_TABS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const;

export default function Requests() {
  const { data: requests, loading, error, reload, setData } = useAsync(async () => (await requestApi.mine()).data.data as CollaborationRequestItem[]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('ALL');
  const [actingId, setActingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => (requests || []).filter((r) => statusFilter === 'ALL' || r.status === statusFilter), [requests, statusFilter]);

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      await requestApi.accept(id);
      toast.success('Accepted — workspace created!');
      setData((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: 'ACCEPTED' } : r)) : prev));
      setTimeout(() => navigate('/influencer/messages'), 800);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      await requestApi.reject(id);
      toast.success('Request declined');
      setData((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)) : prev));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Collaboration requests</h1>
        <p className="mt-1 text-sm text-ink/50">Brands who want to work with you directly.</p>
      </div>

      {!loading && !error && requests && requests.length > 0 && (
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
          icon={<FiInbox />}
          title={requests?.length ? 'No requests match this filter' : 'No requests yet'}
          description={requests?.length ? undefined : 'A complete, featured portfolio helps brands find and invite you.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <GlassCard key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {r.brand?.logoUrl ? (
                      <img src={r.brand.logoUrl} className="h-7 w-7 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-xs font-bold text-ink/50">
                        {r.brand?.brandName?.[0]}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-ink">{r.brand?.brandName}</span>
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="mt-2 font-display text-base font-semibold text-ink">{r.campaignName}</p>
                  <p className="mt-1 text-sm text-ink/55">{r.message}</p>
                  {r.deliverables?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.deliverables.map((d, i) => (
                        <Badge key={i}>{d}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {r.budget && <p className="mb-2 font-display text-lg font-semibold text-brand-purple">₹{r.budget.toLocaleString()}</p>}
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button className="!py-2 text-xs" icon={<FiCheck size={13} />} loading={actingId === r.id} onClick={() => handleAccept(r.id)}>
                        Accept
                      </Button>
                      <Button variant="secondary" className="!py-2 text-xs" icon={<FiX size={13} />} onClick={() => handleReject(r.id)}>
                        Decline
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
