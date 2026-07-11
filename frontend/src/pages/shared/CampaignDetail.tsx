import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiUsers, FiCheckSquare } from 'react-icons/fi';
import { campaignApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, GlassCard, Loader, Modal, Input, TextArea, statusTone } from '../../components/ui';
import type { Campaign } from '../../types';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    campaignApi
      .getById(id)
      .then((res) => setCampaign(res.data.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await campaignApi.apply(id, { message, expectedPrice: expectedPrice ? Number(expectedPrice) : undefined });
      toast.success('Application submitted!');
      setApplyOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader size={32} />;
  if (!campaign) return <p className="py-20 text-center text-ink/40">Campaign not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {campaign.moodboardImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl2">
          {campaign.moodboardImages.slice(0, 3).map((img) => (
            <img key={img.id} src={img.imageUrl} className="h-40 w-full object-cover" alt="" />
          ))}
        </div>
      )}

      <GlassCard className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {campaign.brand?.logoUrl ? (
                <img src={campaign.brand.logoUrl} className="h-7 w-7 rounded-full object-cover" alt="" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-xs font-bold text-ink/50">
                  {campaign.brand?.brandName?.[0]}
                </div>
              )}
              <span className="text-sm font-medium text-ink/60">{campaign.brand?.brandName}</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">{campaign.title}</h1>
          </div>
          <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/60">{campaign.description}</p>

        <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink/50">
          <span className="font-semibold text-brand-purple">
            {campaign.budgetMin || campaign.budgetMax
              ? `₹${(campaign.budgetMin || 0).toLocaleString()} – ₹${(campaign.budgetMax || campaign.budgetMin || 0).toLocaleString()}`
              : 'Budget on request'}
          </span>
          {campaign.location && (
            <span className="flex items-center gap-1.5">
              <FiMapPin size={13} /> {campaign.location}
            </span>
          )}
          {campaign.deadline && (
            <span className="flex items-center gap-1.5">
              <FiClock size={13} /> Due {new Date(campaign.deadline).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <FiUsers size={13} /> {campaign.creatorsNeeded} creator{campaign.creatorsNeeded > 1 ? 's' : ''} needed
          </span>
        </div>

        <div className="mt-4">
          <Badge>{campaign.category}</Badge>
        </div>

        {campaign.deliverables.length > 0 && (
          <div className="mt-6 border-t border-ink/5 pt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Deliverables</h3>
            <ul className="space-y-1.5">
              {campaign.deliverables.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink/65">
                  <FiCheckSquare className="text-brand-purple" size={14} />
                  {d.quantity}x {d.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {user?.role === 'INFLUENCER' && campaign.status === 'ACTIVE' && (
          <Button onClick={() => setApplyOpen(true)} className="mt-6 w-full sm:w-auto">
            Apply to this campaign
          </Button>
        )}
      </GlassCard>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply to "${campaign.title}"`}>
        <div className="space-y-4">
          <TextArea label="Message to the brand" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them why you're a great fit..." />
          <Input label="Expected price (optional)" type="number" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} />
          <Button onClick={handleApply} loading={applying} disabled={!message.trim()} className="w-full">
            Submit application
          </Button>
        </div>
      </Modal>
    </div>
  );
}
