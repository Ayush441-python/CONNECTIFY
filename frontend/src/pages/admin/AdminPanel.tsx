import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiBriefcase, FiSend, FiMessageCircle, FiFlag, FiSlash, FiCheckCircle, FiTrash2, FiSearch } from 'react-icons/fi';
import { adminApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { DonutChart, SimpleBarChart } from '../../components/Charts';
import { Badge, ErrorState, GlassCard, Input, ListSkeleton, Loader, StatCardSkeleton } from '../../components/ui';

interface Stats {
  totalUsers: number;
  totalBrands: number;
  totalInfluencers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalApplications: number;
  totalMessages: number;
  pendingReports: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  influencerProfile?: { name: string; username: string } | null;
  brandProfile?: { brandName: string } | null;
}

export default function AdminPanel() {
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview');
  const stats = useAsync(async () => (await adminApi.stats()).data.data as Stats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin panel</h1>
        <p className="mt-1 text-sm text-ink/50">Platform overview and moderation.</p>
      </div>

      <div className="flex gap-2 border-b border-ink/5">
        {(['overview', 'users', 'reports'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'border-brand-purple text-brand-purple' : 'border-transparent text-ink/40 hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' &&
        (stats.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats.error ? (
          <ErrorState message={stats.error} onRetry={stats.reload} />
        ) : (
          stats.data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total users" value={stats.data.totalUsers} icon={<FiUsers />} />
                <StatCard label="Brands" value={stats.data.totalBrands} icon={<FiBriefcase />} />
                <StatCard label="Influencers" value={stats.data.totalInfluencers} icon={<FiUsers />} />
                <StatCard label="Active campaigns" value={stats.data.activeCampaigns} icon={<FiBriefcase />} />
                <StatCard label="Total campaigns" value={stats.data.totalCampaigns} icon={<FiBriefcase />} />
                <StatCard label="Applications" value={stats.data.totalApplications} icon={<FiSend />} />
                <StatCard label="Messages sent" value={stats.data.totalMessages} icon={<FiMessageCircle />} />
                <StatCard label="Pending reports" value={stats.data.pendingReports} icon={<FiFlag />} />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <h2 className="mb-2 font-display text-lg font-semibold">User breakdown</h2>
                  <DonutChart
                    data={[
                      { name: 'Brands', value: stats.data.totalBrands },
                      { name: 'Influencers', value: stats.data.totalInfluencers },
                    ]}
                  />
                </GlassCard>
                <GlassCard className="p-5">
                  <h2 className="mb-2 font-display text-lg font-semibold">Platform activity</h2>
                  <SimpleBarChart
                    data={[
                      { name: 'Campaigns', value: stats.data.totalCampaigns },
                      { name: 'Applications', value: stats.data.totalApplications },
                      { name: 'Messages', value: stats.data.totalMessages },
                    ]}
                  />
                </GlassCard>
              </div>
            </div>
          )
        ))}

      {tab === 'users' && <UsersTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const users = useAsync(async () => (await adminApi.listUsers({ search: debounced || undefined })).data.data as AdminUser[], [debounced]);

  const handleSuspend = async (id: string, suspend: boolean) => {
    try {
      if (suspend) await adminApi.suspendUser(id);
      else await adminApi.activateUser(id);
      users.setData((prev) => (prev ? prev.map((u) => (u.id === id ? { ...u, isSuspended: suspend } : u)) : prev));
      toast.success(suspend ? 'User suspended' : 'User activated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      users.setData((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
      toast.success('User deleted');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or mobile..." className="input-field pl-10" />
      </div>

      {users.loading ? (
        <ListSkeleton rows={6} />
      ) : users.error ? (
        <ErrorState message={users.error} onRetry={users.reload} />
      ) : (
        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/5 text-xs uppercase tracking-wide text-ink/40">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users.data || []).map((u) => (
                <tr key={u.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{u.influencerProfile?.name || u.brandProfile?.brandName || '—'}</td>
                  <td className="px-4 py-3 text-ink/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.isSuspended ? 'danger' : 'success'}>{u.isSuspended ? 'Suspended' : 'Active'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink/45">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {u.isSuspended ? (
                        <button onClick={() => handleSuspend(u.id, false)} className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-emerald-600" title="Activate">
                          <FiCheckCircle size={15} />
                        </button>
                      ) : (
                        <button onClick={() => handleSuspend(u.id, true)} className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-amber-600" title="Suspend">
                          <FiSlash size={15} />
                        </button>
                      )}
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => handleDelete(u.id)} className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-brand-pink" title="Delete">
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(users.data || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/40">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}

interface ReportItem {
  id: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
  reporter: { email: string };
  reportedUser?: { email: string; role: string } | null;
}

function ReportsTab() {
  const reports = useAsync(async () => (await adminApi.listReports()).data.data as ReportItem[]);

  if (reports.loading) return <Loader size={28} />;
  if (reports.error) return <ErrorState message={reports.error} onRetry={reports.reload} />;
  if (!reports.data || reports.data.length === 0) return <p className="py-12 text-center text-sm text-ink/40">No reports filed.</p>;

  return (
    <div className="space-y-3">
      {reports.data.map((r) => (
        <GlassCard key={r.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{r.reason}</p>
              {r.details && <p className="mt-1 text-sm text-ink/55">{r.details}</p>}
              <p className="mt-1.5 text-xs text-ink/40">
                Reported by {r.reporter.email}
                {r.reportedUser ? ` · against ${r.reportedUser.email}` : ''}
              </p>
            </div>
            <Badge tone={r.status === 'PENDING' ? 'warning' : 'success'}>{r.status}</Badge>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <GlassCard className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">{icon}</div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink/45">{label}</p>
    </GlassCard>
  );
}
