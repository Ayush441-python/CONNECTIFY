import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiBookmark, FiArrowRight, FiPlus } from 'react-icons/fi';
import { campaignApi, savedApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { SimpleBarChart } from '../../components/Charts';
import { Badge, GlassCard, StatCardSkeleton, ListSkeleton, ErrorState, statusTone } from '../../components/ui';
import type { Campaign } from '../../types';

export default function BrandDashboard() {
  const { profile } = useAuth();
  const brandName = profile && 'brandName' in profile ? profile.brandName : '';

  const campaigns = useAsync(async () => (await campaignApi.mine()).data.data as Campaign[]);
  const saved = useAsync(async () => (await savedApi.listSavedCreators()).data as { data: unknown[] });

  const anyError = campaigns.error || saved.error;
  const anyLoading = campaigns.loading || saved.loading;

  if (anyError && !anyLoading) {
    return (
      <ErrorState
        message={anyError}
        onRetry={() => {
          campaigns.reload();
          saved.reload();
        }}
      />
    );
  }

  const list = campaigns.data || [];
  const totalApplications = list.reduce((sum, c) => sum + (c._count?.applications || 0), 0);
  const activeCampaigns = list.filter((c) => c.status === 'ACTIVE').length;
  const savedCount = saved.data?.data.length || 0;

  const statusData = ['DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED'].map((s) => ({
    name: s.charAt(0) + s.slice(1).toLowerCase(),
    value: list.filter((c) => c.status === s).length,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back{brandName ? `, ${brandName}` : ''}</h1>
          <p className="mt-1 text-sm text-ink/50">Here's an overview of your campaigns.</p>
        </div>
        <Link to="/brand/campaigns?new=1" className="btn-primary">
          <FiPlus /> New campaign
        </Link>
      </div>

      {anyLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Active campaigns" value={activeCampaigns} icon={<FiBriefcase />} />
          <StatCard label="Total applications" value={totalApplications} icon={<FiUsers />} />
          <StatCard label="Saved creators" value={savedCount} icon={<FiBookmark />} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-1">
          <h2 className="mb-2 font-display text-lg font-semibold">Campaigns by status</h2>
          {anyLoading ? <div className="h-[240px] animate-pulse rounded-xl bg-ink/[0.05]" /> : <SimpleBarChart data={statusData} />}
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your campaigns</h2>
            <Link to="/brand/campaigns" className="flex items-center gap-1 text-xs font-semibold text-brand-purple">
              Manage all <FiArrowRight size={12} />
            </Link>
          </div>
          {anyLoading ? (
            <ListSkeleton rows={4} />
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/40">No campaigns yet — create your first one to start receiving applications.</p>
          ) : (
            <div className="space-y-3">
              {list.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to="/brand/campaigns"
                  className="flex items-center justify-between rounded-xl border border-ink/5 bg-white/60 p-3.5 transition-colors hover:border-brand-purple/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.title}</p>
                    <p className="text-xs text-ink/40">{c._count?.applications || 0} applications</p>
                  </div>
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </Link>
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
