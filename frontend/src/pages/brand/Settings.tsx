import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { Avatar, Button, ChipSelect, GlassCard, Input, TextArea } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { BrandProfile } from '../../types';

export default function BrandSettings() {
  const { profile, setProfile } = useAuth();
  const p = profile as BrandProfile;
  const [form, setForm] = useState({
    brandName: p?.brandName || '',
    industry: p?.industry || '',
    website: p?.website || '',
    about: p?.about || '',
    city: p?.city || '',
    state: p?.state || '',
    country: p?.country || '',
  });
  const [preferredCategories, setPreferredCategories] = useState<string[]>(p?.preferredCategories || []);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileApi.updateBrand({ ...form, preferredCategories });
      setProfile(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await profileApi.uploadPhoto(file);
      setProfile(res.data.data);
      toast.success('Logo updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/50">Manage your brand profile.</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={p?.logoUrl} name={p?.brandName || 'B'} size={64} />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
            >
              <FiCamera size={11} />
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{p?.brandName}</p>
            <p className="text-sm text-ink/45">{p?.industry || 'Industry not set'}</p>
          </div>
          {uploadingLogo && <span className="ml-auto text-xs text-ink/40">Uploading...</span>}
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <Input label="Brand name" value={form.brandName} onChange={handleChange('brandName')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Industry" value={form.industry} onChange={handleChange('industry')} />
          <Input label="Website" value={form.website} onChange={handleChange('website')} />
        </div>
        <TextArea label="About" value={form.about} onChange={handleChange('about')} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="City" value={form.city} onChange={handleChange('city')} />
          <Input label="State" value={form.state} onChange={handleChange('state')} />
          <Input label="Country" value={form.country} onChange={handleChange('country')} />
        </div>
        <ChipSelect label="Preferred categories" options={CATEGORIES} value={preferredCategories} onChange={setPreferredCategories} />

        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          Save changes
        </Button>
      </GlassCard>
    </div>
  );
}
