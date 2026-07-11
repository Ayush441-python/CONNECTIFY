import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMapPin, FiInstagram, FiGlobe, FiBookmark, FiSend } from 'react-icons/fi';
import { profileApi, requestApi, savedApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button, GlassCard, Input, Loader, Modal, TextArea } from '../../components/ui';
import type { InfluencerProfile } from '../../types';

const tierLabels: Record<string, string> = {
  NANO: 'Nano · 1K-10K',
  MICRO: 'Micro · 10K-100K',
  MACRO: 'Macro · 100K-1M',
  MEGA: 'Mega · 1M+',
};

export default function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [creator, setCreator] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ campaignName: '', message: '', budget: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileApi
      .getCreatorByUsername(username)
      .then((res) => setCreator(res.data.data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [username]);

  const handleSave = async () => {
    if (!creator) return;
    try {
      if (saved) {
        await savedApi.unsaveCreator(creator.id);
      } else {
        await savedApi.saveCreator(creator.id);
        toast.success('Creator saved');
      }
      setSaved(!saved);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSendRequest = async () => {
    if (!creator) return;
    setSending(true);
    try {
      await requestApi.send({
        influencerId: creator.id,
        campaignName: requestForm.campaignName,
        message: requestForm.message,
        budget: requestForm.budget ? Number(requestForm.budget) : undefined,
        deliverables: [],
      });
      toast.success('Request sent!');
      setRequestOpen(false);
      setRequestForm({ campaignName: '', message: '', budget: '' });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader size={32} />;
  if (!creator) return <p className="py-20 text-center text-ink/40">Creator not found.</p>;

  const isBrand = user?.role === 'BRAND';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="relative overflow-hidden rounded-xl2 bg-brand-gradient-soft">
        {creator.featuredCoverUrl ? (
          <img src={creator.featuredCoverUrl} alt="" className="h-56 w-full object-cover" />
        ) : (
          <div className="h-40 w-full" />
        )}
      </div>

      <GlassCard className="-mt-16 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar src={creator.profilePhotoUrl} name={creator.name} size={88} />
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{creator.name}</h1>
              <p className="text-sm text-ink/45">@{creator.username}</p>
            </div>
          </div>
          {isBrand && (
            <div className="flex gap-2">
              <Button variant="secondary" icon={<FiBookmark className={saved ? 'fill-current' : ''} />} onClick={handleSave}>
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button icon={<FiSend />} onClick={() => setRequestOpen(true)}>
                Send request
              </Button>
            </div>
          )}
        </div>

        {creator.bio && <p className="mt-4 text-sm leading-relaxed text-ink/60">{creator.bio}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink/50">
          {creator.city && (
            <span className="flex items-center gap-1.5">
              <FiMapPin size={13} /> {[creator.city, creator.state, creator.country].filter(Boolean).join(', ')}
            </span>
          )}
          {creator.instagramUsername && (
            <span className="flex items-center gap-1.5">
              <FiInstagram size={13} /> {creator.instagramUsername}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <FiGlobe size={13} /> {creator.languages.join(', ') || 'Languages not set'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="brand">{tierLabels[creator.tier]}</Badge>
          <Badge tone={creator.availability === 'AVAILABLE' ? 'success' : 'warning'}>{creator.availability}</Badge>
          {creator.categories.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
      </GlassCard>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Portfolio</h2>
        {!creator.portfolioImages || creator.portfolioImages.length === 0 ? (
          <p className="text-sm text-ink/40">No portfolio images yet.</p>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
            {creator.portfolioImages.map((img) => (
              <div key={img.id} className="glass-card break-inside-avoid overflow-hidden">
                <img src={img.imageUrl} alt={img.caption || ''} className="w-full object-cover" />
                {img.caption && <p className="p-2 text-xs text-ink/50">{img.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title={`Invite ${creator.name} to collaborate`}>
        <div className="space-y-4">
          <Input
            label="Campaign name"
            value={requestForm.campaignName}
            onChange={(e) => setRequestForm({ ...requestForm, campaignName: e.target.value })}
            placeholder="e.g. Diwali collection shoot"
          />
          <TextArea
            label="Message"
            value={requestForm.message}
            onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
            placeholder="Tell them about the opportunity..."
          />
          <Input
            label="Budget (optional)"
            type="number"
            value={requestForm.budget}
            onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
          />
          <Button onClick={handleSendRequest} loading={sending} disabled={!requestForm.campaignName || !requestForm.message} className="w-full">
            Send request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
