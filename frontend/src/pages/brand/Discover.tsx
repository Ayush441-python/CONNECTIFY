import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { discoverApi, savedApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { CreatorCard } from '../../components/CreatorCard';
import { Button, CardSkeleton, EmptyState, Select } from '../../components/ui';
import { CATEGORIES, TIERS } from '../../constants';
import type { InfluencerProfile } from '../../types';

export default function Discover() {
  const [creators, setCreators] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('');
  const [sort, setSort] = useState<'newest' | 'trending'>('newest');

  const fetchPage = async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await discoverApi.browse({
        search: search || undefined,
        category: category || undefined,
        tier: tier || undefined,
        sort,
        page: pageNum,
      });
      const items: InfluencerProfile[] = res.data.data;
      setTotalPages(res.data.meta?.totalPages || 1);
      setCreators((prev) => (append ? [...prev, ...items] : items));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, tier, sort]);

  const handleSave = async (id: string) => {
    const alreadySaved = savedIds.has(id);
    try {
      if (alreadySaved) {
        await savedApi.unsaveCreator(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await savedApi.saveCreator(id);
        setSavedIds((prev) => new Set(prev).add(id));
        toast.success('Creator saved');
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Discover creators</h1>
        <p className="mt-1 text-sm text-ink/50">Browse creators by category, tier, and location.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, bio..."
            className="input-field pl-10"
          />
        </div>
        <Select value={tier} onChange={(e) => setTier(e.target.value)} className="!w-auto">
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'trending')} className="!w-auto">
          <option value="newest">Recently joined</option>
          <option value="trending">Trending</option>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            !category ? 'bg-brand-gradient text-white shadow-glow' : 'border border-ink/10 bg-white text-ink/60'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? '' : c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              category === c ? 'bg-brand-gradient text-white shadow-glow' : 'border border-ink/10 bg-white text-ink/60'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <EmptyState icon={<FiUsers />} title="No creators found" description="Try adjusting your filters or search." />
      ) : (
        <>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} onSave={() => handleSave(creator.id)} saved={savedIds.has(creator.id)} />
            ))}
          </div>
          {page < totalPages && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                loading={loadingMore}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchPage(next, true);
                }}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
