import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiStar, FiTrash2, FiImage } from 'react-icons/fi';
import { portfolioApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Button, CardSkeleton, EmptyState, ErrorState, Modal, Input, Select } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { PortfolioImage } from '../../types';

const MAX_IMAGES = 20;

export default function Portfolio() {
  const { data: images, loading, error, reload, setData } = useAsync(async () => (await portfolioApi.list()).data.data as PortfolioImage[]);
  const [uploading, setUploading] = useState(false);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setModalFile(file);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!modalFile) return;
    setUploading(true);
    try {
      await portfolioApi.add(modalFile, caption, category, false);
      toast.success('Image added to portfolio');
      setModalFile(null);
      setCaption('');
      reload();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const toggleFeatured = async (img: PortfolioImage) => {
    try {
      await portfolioApi.update(img.id, { featured: !img.featured });
      setData((prev) => (prev ? prev.map((i) => (i.id === img.id ? { ...i, featured: !i.featured } : i)) : prev));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await portfolioApi.remove(id);
      setData((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
      toast.success('Image removed');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const count = images?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Portfolio</h1>
          <p className="mt-1 text-sm text-ink/50">
            {count}/{MAX_IMAGES} images · Featured images appear first on your public profile
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={count >= MAX_IMAGES} icon={<FiPlus />}>
          Add image
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>

      {loading ? (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : count === 0 ? (
        <EmptyState
          icon={<FiImage />}
          title="No portfolio images yet"
          description="Add up to 20 images to showcase your best work to brands."
          action={<Button onClick={() => fileInputRef.current?.click()} icon={<FiPlus />}>Add your first image</Button>}
        />
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {images!.map((img) => (
            <div key={img.id} className="glass-card group relative break-inside-avoid overflow-hidden">
              <img src={img.imageUrl} alt={img.caption || ''} className="w-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggleFeatured(img)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md ${
                      img.featured ? 'bg-brand-gradient text-white' : 'bg-white/70 text-ink/60'
                    }`}
                    title="Toggle featured"
                  >
                    <FiStar size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-ink/60 backdrop-blur-md hover:text-brand-pink"
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
                {img.caption && <p className="truncate text-xs text-white">{img.caption}</p>}
              </div>
              {img.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-semibold text-white">
                  Featured
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modalFile} onClose={() => setModalFile(null)} title="Add portfolio image">
        {modalFile && (
          <div className="space-y-4">
            <img src={URL.createObjectURL(modalFile)} alt="Preview" className="max-h-64 w-full rounded-xl object-cover" />
            <Input label="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Behind the scenes at..." />
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button onClick={handleUpload} loading={uploading} className="w-full">
              Upload
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
