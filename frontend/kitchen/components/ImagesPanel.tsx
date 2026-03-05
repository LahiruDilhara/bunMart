'use client';
import { useState } from 'react';
import { ProductionOrder } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import { ImagePlus, Trash2, X } from 'lucide-react';

interface Props {
  order: ProductionOrder;
  onUpdated: (o: ProductionOrder) => void;
}

export default function ImagesPanel({ order, onUpdated }: Props) {
  const [addingUrl, setAddingUrl] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleAdd() {
    if (!addingUrl.trim()) return;
    setLoading(true);
    try {
      const updated = await kitchenApi.addImage(order.id, { imageUrl: addingUrl.trim() });
      onUpdated(updated);
      setAddingUrl('');
      setShowInput(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    try {
      const updated = await kitchenApi.deleteImage(order.id, imageId);
      onUpdated(updated);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          Images ({order.images.length})
        </span>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors font-semibold"
        >
          <ImagePlus size={13} /> Add
        </button>
      </div>

      {showInput && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={addingUrl}
            onChange={e => setAddingUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Paste image URL…"
            className="flex-1 bg-white/5 border border-white/10 focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !addingUrl.trim()}
            className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors"
          >
            {loading ? '…' : 'Add'}
          </button>
          <button onClick={() => setShowInput(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {order.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {order.images.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt="Preparation"
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setPreview(img.imageUrl)}
              />
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-600 italic">No images yet</p>
      )}

      {/* Full-size preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-w-2xl max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
