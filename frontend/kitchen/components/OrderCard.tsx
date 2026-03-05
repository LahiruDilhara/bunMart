'use client';
import { useState } from 'react';
import { ProductionOrder } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import PhaseBadge from './PhaseBadge';
import ProgressBar from './ProgressBar';
import NotesEditor from './NotesEditor';
import ImagesPanel from './ImagesPanel';
import UpdatePhaseModal from './UpdatePhaseModal';
import TimeAgo from './TimeAgo';
import { ChevronDown, ChevronUp, Trash2, ArrowRightLeft } from 'lucide-react';

interface Props {
  order: ProductionOrder;
  onUpdated: (o: ProductionOrder) => void;
  onDeleted: (id: string) => void;
}

export default function OrderCard({ order, onUpdated, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete production order for #${order.userOrderId}?`)) return;
    setDeleting(true);
    try {
      await kitchenApi.deleteOrder(order.id);
      onDeleted(order.id);
    } catch {
      setDeleting(false);
    }
  }

  const isUrgent = order.phase !== 'COMPLETED' && Date.now() - new Date(order.createdAt).getTime() > 20 * 60 * 1000;

  return (
    <>
      <div
        className={`animate-fade-in bg-white/500 border rounded-2xl overflow-hidden transition-all duration-300 ${
          isUrgent ? 'border-red-500/30' : 'border-gray-200 hover:border-white/15'
        }`}
      >
        {/* Urgency stripe */}
        {isUrgent && (
          <div className="h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
        )}

        {/* Card header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">Order</span>
                {isUrgent && (
                  <span className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    ⚠ Delayed
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-800 text-base tracking-tight">
                #{order.userOrderId.slice(-8).toUpperCase()}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                <span title="Order created">🕐 <TimeAgo timestamp={order.createdAt} /></span>
                {order.updatedAt !== order.createdAt && (
                  <span title="Last updated">· upd <TimeAgo timestamp={order.updatedAt} /></span>
                )}
              </div>
            </div>
            <PhaseBadge phase={order.phase} />
          </div>

          <ProgressBar percent={order.progressPercent} phase={order.phase} />

          {/* Lines summary */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {order.lines.map((line, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/500 border border-white/8 text-xs font-mono text-gray-300"
              >
                <span className="text-orange-400 font-semibold">{line.quantity}×</span>
                {line.productId}
              </span>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="border-t border-white/5 px-5 py-3 flex items-center gap-2">
          <button
            onClick={() => setShowPhaseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg hover:bg-orange-500/20 transition-all"
          >
            <ArrowRightLeft size={12} /> Update Phase
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-gray-500 hover:text-white text-xs font-mono transition-colors"
          >
            {expanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="border-t border-white/5 p-5 space-y-5 animate-fade-in">
            {/* Notes */}
            <div className="space-y-2">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Kitchen Notes</p>
              <NotesEditor order={order} onUpdated={onUpdated} />
            </div>

            {/* Images */}
            <div className="border-t border-white/5 pt-4">
              <ImagesPanel order={order} onUpdated={onUpdated} />
            </div>

            {/* Meta */}
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-3 text-xs font-mono text-gray-600">
              <div>
                <p className="text-gray-700 uppercase tracking-wider mb-1">Production ID</p>
                <p className="text-gray-500 truncate">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-700 uppercase tracking-wider mb-1">User Order ID</p>
                <p className="text-gray-500 truncate">{order.userOrderId}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPhaseModal && (
        <UpdatePhaseModal
          order={order}
          onClose={() => setShowPhaseModal(false)}
          onUpdated={updated => { onUpdated(updated); setShowPhaseModal(false); }}
        />
      )}
    </>
  );
}
