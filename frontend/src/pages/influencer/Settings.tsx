import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { Avatar, Button, ChipSelect, GlassCard, Input, Select, TextArea } from '../../components/ui';
import { AVAILABILITY_OPTIONS, CATEGORIES, LANGUAGES, TIERS } from '../../constants';
import type { InfluencerProfile } from '../../types';

export default function InfluencerSettings() {
  const { profile, setProfile } = useAuth();
  const p = profile as InfluencerProfile;
  const [form, setForm] = useState({
    name: p?.name || '',
    instagramUsername: p?.instagramUsername || '',
    city: p?.city || '',
    state: p?.state || '',
    country: p?.country || '',
    bio: p?.bio || '',
    tier: p?.tier || 'NANO',
    availability: p?.availability || 'AVAILABLE',
  });
  const [categories, setCategories] = useState<string[]>(p?.categories || []);
  const [languages, setLanguages] = useState<string[]>(p?.languages || []);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileApi.updateInfluencer({ ...form, categories, languages });
      setProfile(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await profileApi.uploadPhoto(file);
      setProfile(res.data.data);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/50">Manage your creator profile.</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={p?.profilePhotoUrl} name={p?.name || 'U'} size={64} />
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
            >
              <FiCamera size={11} />
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{p?.name}</p>
            <p className="text-sm text-ink/45">@{p?.username}</p>
          </div>
          {uploadingPhoto && <span className="ml-auto text-xs text-ink/40">Uploading...</span>}
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <Input label="Full name" value={form.name} onChange={handleChange('name')} />
        <Input label="Instagram username" value={form.instagramUsername} onChange={handleChange('instagramUsername')} />
        <TextArea label="Bio" value={form.bio} onChange={handleChange('bio')} placeholder="Tell brands about yourself..." />
        <div className="grid grid-cols-3 gap-3">
          <Input label="City" value={form.city} onChange={handleChange('city')} />
          <Input label="State" value={form.state} onChange={handleChange('state')} />
          <Input label="Country" value={form.country} onChange={handleChange('country')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tier" value={form.tier} onChange={handleChange('tier')}>
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select label="Availability" value={form.availability} onChange={handleChange('availability')}>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </div>
        <ChipSelect label="Categories" options={CATEGORIES} value={categories} onChange={setCategories} />
        <ChipSelect label="Languages" options={LANGUAGES} value={languages} onChange={setLanguages} />

        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          Save changes
        </Button>
      </GlassCard>
    </div>
  );
}
