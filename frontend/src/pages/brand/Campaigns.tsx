import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiUsers, FiBriefcase, FiX, FiSearch } from 'react-icons/fi';
import { campaignApi, uploadApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Badge, Button, CardSkeleton, EmptyState, ErrorState, GlassCard, Input, Modal, Select, TextArea, statusTone } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { Campaign, Deliverable } from '../../types';

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  budgetMin: '',
  budgetMax: '',
  location: '',
  deadline: '',
  creatorsNeeded: 1,
  status: 'DRAFT' as Campaign['status'],
};

const STATUS_TABS = ['ALL', 'DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED'] as const;

export default function BrandCampaigns() {
  const [params, setParams] = useSearchParams();
  const { data: campaigns, loading, error, reload, setData } = useAsync(async () => (await campaignApi.mine()).data.data as Campaign[]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_TABS)[number]>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([{ description: '', quantity: 1 }]);
  const [moodboardUrls, setMoodboardUrls] = useState<string[]>([]);
  const [uploadingMoodboard, setUploadingMoodboard] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.get('new') === '1') {
      openCreateModal();
      params.delete('new');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return (campaigns || []).filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, statusFilter, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDeliverables([{ description: '', quantity: 1 }]);
    setMoodboardUrls([]);
    setModalOpen(true);
  };

  const openEditModal = (c: Campaign) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description,
      category: c.category,
      budgetMin: c.budgetMin?.toString() || '',
      budgetMax: c.budgetMax?.toString() || '',
      location: c.location || '',
      deadline: c.deadline ? c.deadline.slice(0, 10) : '',
      creatorsNeeded: c.creatorsNeeded,
      status: c.status,
    });
    setDeliverables(c.deliverables.length ? c.deliverables : [{ description: '', quantity: 1 }]);
    setMoodboardUrls(c.moodboardImages.map((m) => m.imageUrl));
    setModalOpen(true);
  };

  const handleMoodboardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMoodboard(true);
    try {
      const res = await uploadApi.image(file, 'moodboards');
      setMoodboardUrls((prev) => [...prev, res.data.data.url]);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploadingMoodboard(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        creatorsNeeded: Number(form.creatorsNeeded),
        deliverables: deliverables.filter((d) => d.description.trim()),
        moodboardImageUrls: moodboardUrls,
      };
      if (editingId) {
        await campaignApi.update(editingId, payload);
        toast.success('Campaign updated');
      } else {
        await campaignApi.create(payload);
        toast.success('Campaign created');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await campaignApi.remove(id);
      toast.success('Campaign deleted');
      setData((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Your campaigns</h1>
          <p className="mt-1 text-sm text-ink/50">Create and manage campaigns to attract creators.</p>
        </div>
        <Button onClick={openCreateModal} icon={<FiPlus />}>
          New campaign
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your campaigns..." className="input-field pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-brand-gradient text-white shadow-glow' : 'border border-ink/10 bg-white text-ink/60'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiBriefcase />}
          title={campaigns?.length ? 'No campaigns match your filters' : 'No campaigns yet'}
          description={campaigns?.length ? 'Try a different search or status filter.' : 'Create your first campaign to start receiving applications.'}
          action={!campaigns?.length ? <Button onClick={openCreateModal} icon={<FiPlus />}>Create campaign</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <GlassCard key={c.id} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-ink">{c.title}</h3>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </div>
              <p className="line-clamp-2 flex-1 text-sm text-ink/50">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>{c.category}</Badge>
                {c.location && <Badge>{c.location}</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
                <Link to={`/brand/campaigns/${c.id}/applications`} className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple">
                  <FiUsers size={13} /> {c._count?.applications || 0} applications
                </Link>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(c)} className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-brand-pink">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit campaign' : 'New campaign'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer collection launch" />
          <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's this campaign about?" />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mumbai / Remote" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Budget min" type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} />
            <Input label="Budget max" type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
            <Input label="Creators needed" type="number" min={1} value={form.creatorsNeeded} onChange={(e) => setForm({ ...form, creatorsNeeded: Number(e.target.value) })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div>
            <label className="label-field">Deliverables</label>
            <div className="space-y-2">
              {deliverables.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="e.g. 2 Reels"
                    value={d.description}
                    onChange={(e) => setDeliverables((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                  />
                  <input
                    type="number"
                    min={1}
                    className="input-field w-20"
                    value={d.quantity}
                    onChange={(e) => setDeliverables((prev) => prev.map((x, idx) => (idx === i ? { ...x, quantity: Number(e.target.value) } : x)))}
                  />
                  <button onClick={() => setDeliverables((prev) => prev.filter((_, idx) => idx !== i))} className="px-2 text-ink/30 hover:text-brand-pink">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDeliverables((prev) => [...prev, { description: '', quantity: 1 }])}
              className="mt-2 text-xs font-semibold text-brand-purple"
            >
              + Add deliverable
            </button>
          </div>

          <div>
            <label className="label-field">Moodboard images</label>
            <div className="flex flex-wrap gap-2">
              {moodboardUrls.map((url, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={url} className="h-full w-full object-cover" alt="" />
                  <button
                    onClick={() => setMoodboardUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-ink/60 text-white"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink/20 text-ink/30 hover:border-brand-purple/40 hover:text-brand-purple">
                {uploadingMoodboard ? '...' : <FiPlus />}
                <input type="file" accept="image/*" className="hidden" onChange={handleMoodboardUpload} />
              </label>
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} disabled={!form.title || !form.description} className="w-full">
            {editingId ? 'Save changes' : 'Create campaign'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
