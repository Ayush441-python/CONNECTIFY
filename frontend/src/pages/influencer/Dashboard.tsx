import { Link } from 'react-router-dom';
import { FiSend, FiInbox, FiImage, FiArrowRight } from 'react-icons/fi';
import { applicationApi, requestApi, portfolioApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { DonutChart } from '../../components/Charts';
import { GlassCard, StatCardSkeleton, ListSkeleton, ErrorState, Badge, statusTone } from '../../components/ui';
import type { CampaignApplication, CollaborationRequestItem, PortfolioImage } from '../../types';

export default function InfluencerDashboard() {
  const { profile } = useAuth();
  const name = profile && 'name' in profile ? profile.name : '';

  const applications = useAsync(async () => (await applicationApi.mine()).data.data as CampaignApplication[]);
  const requests = useAsync(async () => (await requestApi.mine()).data.data as CollaborationRequestItem[]);
  const portfolio = useAsync(async () => (await portfolioApi.list()).data.data as PortfolioImage[]);

  const anyError = applications.error || requests.error || portfolio.error;
  const anyLoading = applications.loading || requests.loading || portfolio.loading;

  if (anyError && !anyLoading) {
    return (
      <ErrorState
        message={anyError}
        onRetry={() => {
          applications.reload();
          requests.reload();
          portfolio.reload();
        }}
      />
    );
  }

  const applicationStatusData = ['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: (applications.data || []).filter((a) => a.status === status).length,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back{name ? `, ${name.split(' ')[0]}` : ''}</h1>
        <p className="mt-1 text-sm text-ink/50">Here's what's happening with your creator profile.</p>
      </div>

      {anyLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Applications sent" value={applications.data?.length || 0} icon={<FiSend />} />
          <StatCard label="Pending requests" value={(requests.data || []).filter((r) => r.status === 'PENDING').length} icon={<FiInbox />} />
          <StatCard label="Portfolio images" value={`${portfolio.data?.length || 0}/20`} icon={<FiImage />} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-1">
          <h2 className="mb-2 font-display text-lg font-semibold">Application status</h2>
          {anyLoading ? <div className="h-[220px] animate-pulse rounded-xl bg-ink/[0.05]" /> : <DonutChart data={applicationStatusData} />}
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent applications</h2>
            <Link to="/influencer/applications" className="flex items-center gap-1 text-xs font-semibold text-brand-purple">
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          {anyLoading ? (
            <ListSkeleton rows={3} />
          ) : applications.data?.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/40">No applications yet — browse campaigns to get started.</p>
          ) : (
            <div className="space-y-3">
              {applications.data?.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink/5 bg-white/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{a.campaign?.title}</p>
                    <p className="text-xs text-ink/40">{a.campaign?.brand?.brandName}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Requests</h2>
            <Link to="/influencer/requests" className="flex items-center gap-1 text-xs font-semibold text-brand-purple">
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          {anyLoading ? (
            <ListSkeleton rows={3} />
          ) : requests.data?.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/40">No direct requests yet — a complete portfolio helps brands find you.</p>
          ) : (
            <div className="space-y-3">
              {requests.data?.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-ink/5 bg-white/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.campaignName}</p>
                    <p className="text-xs text-ink/40">{r.brand?.brandName}</p>
                  </div>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <GlassCard className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">{icon}</div>
      <div>
        <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        <p className="text-xs text-ink/45">{label}</p>
      </div>
    </GlassCard>
  );
}
