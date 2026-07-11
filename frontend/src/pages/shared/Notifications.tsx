import { Link } from 'react-router-dom';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { notificationApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Button, EmptyState, ErrorState, GlassCard, ListSkeleton } from '../../components/ui';
import type { AppNotification } from '../../types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const { data: items, loading, error, reload, setData } = useAsync(async () => (await notificationApi.list()).data.data as AppNotification[]);

  const markRead = async (id: string) => {
    await notificationApi.markRead(id);
    setData((prev) => (prev ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : prev));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setData((prev) => (prev ? prev.map((n) => ({ ...n, isRead: true })) : prev));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink/50">Stay on top of applications, requests, and messages.</p>
        </div>
        {items?.some((n) => !n.isRead) && (
          <Button variant="secondary" icon={<FiCheckCircle />} onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !items || items.length === 0 ? (
        <EmptyState icon={<FiBell />} title="You're all caught up" description="New notifications will show up here." />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const content = (
              <GlassCard className={`flex items-start gap-3 p-4 transition-colors ${!n.isRead ? 'border-brand-purple/20 bg-brand-gradient-soft' : ''}`}>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink/55">{n.message}</p>
                  <p className="mt-1 text-xs text-ink/35">{timeAgo(n.createdAt)}</p>
                </div>
              </GlassCard>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => !n.isRead && markRead(n.id)}>
                {content}
              </Link>
            ) : (
              <div key={n.id} onClick={() => !n.isRead && markRead(n.id)} className="cursor-pointer">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
