'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductionOrder } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import PhaseBadge from '@/components/kitchen/PhaseBadge';
import ProgressBar from '@/components/kitchen/ProgressBar';
import NotesEditor from '@/components/kitchen/NotesEditor';
import ImagesPanel from '@/components/kitchen/ImagesPanel';
import UpdatePhaseModal from '@/components/kitchen/UpdatePhaseModal';
import TimeAgo from '@/components/kitchen/TimeAgo';
import { ArrowLeft, ArrowRightLeft, Trash2 } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhaseModal, setShowPhaseModal] = useState(false);

  useEffect(() => {
    kitchenApi.getOrder(id)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!order || !confirm('Delete this production order?')) return;
    await kitchenApi.deleteOrder(order.id);
    router.push('/production-orders');
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-orange-400 font-mono animate-pulse">Loading order…</div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-red-400">{error || 'Order not found'}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">Production Order</p>
              <h1 className="text-2xl font-bold text-white">#{order.userOrderId.slice(-8).toUpperCase()}</h1>
              <p className="text-xs font-mono text-gray-600 mt-1">ID: {order.id}</p>
            </div>
            <PhaseBadge phase={order.phase} />
          </div>

          <ProgressBar percent={order.progressPercent} phase={order.phase} />

          {/* Timestamps */}
          <div className="flex gap-6 text-xs font-mono text-gray-600">
            <span>Created <TimeAgo timestamp={order.createdAt} /></span>
            <span>Updated <TimeAgo timestamp={order.updatedAt} /></span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setShowPhaseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold rounded-xl hover:bg-orange-500/20 transition-all"
            >
              <ArrowRightLeft size={14} /> Update Phase
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-500/10 transition-all ml-auto"
            >
              <Trash2 size={14} /> Delete Order
            </button>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Production Lines</h2>
          <div className="divide-y divide-white/5">
            {order.lines.map((line, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="font-mono text-sm text-gray-300">{line.productId}</span>
                <span className="font-mono text-sm font-semibold text-orange-400">{line.quantity}×</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Kitchen Notes</h2>
          <NotesEditor order={order} onUpdated={setOrder} />
        </div>

        {/* Images */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
          <ImagesPanel order={order} onUpdated={setOrder} />
        </div>
      </div>

      {showPhaseModal && (
        <UpdatePhaseModal
          order={order}
          onClose={() => setShowPhaseModal(false)}
          onUpdated={updated => { setOrder(updated); setShowPhaseModal(false); }}
        />
      )}
    </div>
  );
}
