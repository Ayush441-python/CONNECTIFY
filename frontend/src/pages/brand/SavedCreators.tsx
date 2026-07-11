import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBookmark, FiSearch } from 'react-icons/fi';
import { savedApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { CreatorCard } from '../../components/CreatorCard';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui';
import type { InfluencerProfile } from '../../types';

interface SavedEntry {
  id: string;
  influencerId: string;
  influencer: InfluencerProfile;
}

export default function SavedCreators() {
  const { data: saved, loading, error, reload, setData } = useAsync(
    async () => (await savedApi.listSavedCreators()).data as unknown as { data: SavedEntry[] }
  );
  const [search, setSearch] = useState('');

  const list = saved?.data || [];
  const filtered = useMemo(
    () => list.filter((s) => !search || s.influencer.name.toLowerCase().includes(search.toLowerCase()) || s.influencer.username.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const handleUnsave = async (influencerId: string) => {
    try {
      await savedApi.unsaveCreator(influencerId);
      setData((prev) => (prev ? { data: prev.data.filter((s) => s.influencerId !== influencerId) } : prev));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Saved creators</h1>
        <p className="mt-1 text-sm text-ink/50">Creators you've bookmarked for future campaigns.</p>
      </div>

      {!loading && !error && list.length > 0 && (
        <div className="relative max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search saved creators..." className="input-field pl-10" />
        </div>
      )}

      {loading ? (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiBookmark />}
          title={list.length ? 'No saved creators match your search' : 'No saved creators yet'}
          description={list.length ? undefined : 'Bookmark creators from Discover to build your shortlist.'}
        />
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {filtered.map((s) => (
            <CreatorCard key={s.id} creator={s.influencer} onSave={() => handleUnsave(s.influencerId)} saved />
          ))}
        </div>
      )}
    </div>
  );
}
