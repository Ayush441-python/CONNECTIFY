import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiBriefcase } from 'react-icons/fi';
import { campaignApi, savedApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { CampaignCard } from '../../components/CampaignCard';
import { Button, CardSkeleton, EmptyState, ErrorState, Input, Modal, Select, TextArea } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { Campaign } from '../../types';

export default function InfluencerCampaigns() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [applyTarget, setApplyTarget] = useState<Campaign | null>(null);
  const [message, setMessage] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data: campaigns,
    loading,
    error,
    reload,
  } = useAsync(
    async () => (await campaignApi.browse({ search: debounced || undefined, category: category || undefined })).data.data as Campaign[],
    [debounced, category]
  );

  const handleApply = async () => {
    if (!applyTarget) return;
    setApplying(true);
    try {
      await campaignApi.apply(applyTarget.id, { message, expectedPrice: expectedPrice ? Number(expectedPrice) : undefined });
      toast.success('Application submitted!');
      setApplyTarget(null);
      setMessage('');
      setExpectedPrice('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async (campaignId: string) => {
    try {
      await savedApi.saveCampaign(campaignId);
      toast.success('Campaign saved');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Browse campaigns</h1>
        <p className="mt-1 text-sm text-ink/50">Find active campaigns matching your niche.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="input-field pl-10"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="!w-auto">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !campaigns || campaigns.length === 0 ? (
        <EmptyState icon={<FiBriefcase />} title="No campaigns found" description="Try a different search or check back soon for new campaigns." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.id} className="space-y-2">
              <CampaignCard campaign={c} />
              <div className="flex gap-2 px-1">
                <Button className="flex-1 !py-2 text-xs" onClick={() => setApplyTarget(c)}>
                  Apply
                </Button>
                <Button variant="secondary" className="!py-2 text-xs" onClick={() => handleSave(c.id)}>
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!applyTarget} onClose={() => setApplyTarget(null)} title={`Apply to "${applyTarget?.title}"`}>
        <div className="space-y-4">
          <TextArea label="Message to the brand" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them why you're a great fit..." />
          <Input
            label="Expected price (optional)"
            type="number"
            value={expectedPrice}
            onChange={(e) => setExpectedPrice(e.target.value)}
            placeholder="e.g. 15000"
          />
          <Button onClick={handleApply} loading={applying} disabled={!message.trim()} className="w-full">
            Submit application
          </Button>
        </div>
      </Modal>
    </div>
  );
}
