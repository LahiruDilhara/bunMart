'use client';
import { useState } from 'react';
import { ProductionOrder } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import { Check, Pencil, X } from 'lucide-react';

interface Props {
  order: ProductionOrder;
  onUpdated: (o: ProductionOrder) => void;
}

export default function NotesEditor({ order, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(order.notes || '');
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const updated = await kitchenApi.updateNotes(order.id, { notes: draft });
      onUpdated(updated);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div
        onClick={() => { setDraft(order.notes || ''); setEditing(true); }}
        className="group flex items-start gap-2 cursor-pointer"
      >
        <p className="text-sm text-gray-400 leading-relaxed flex-1 min-h-[1.5rem]">
          {order.notes || <span className="text-gray-600 italic">Add kitchen notes…</span>}
        </p>
        <Pencil size={13} className="text-gray-600 group-hover:text-orange-400 transition-colors mt-0.5 shrink-0" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={3}
        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-white resize-none outline-none transition-colors"
        placeholder="Kitchen notes…"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors"
        >
          <Check size={12} /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-gray-400 text-xs rounded-lg hover:text-white transition-colors"
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}
