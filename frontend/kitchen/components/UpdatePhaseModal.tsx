'use client';
import { useState } from 'react';
import { ProductionOrder, Phase } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import { X } from 'lucide-react';

const PHASES: { value: Phase; label: string; icon: string }[] = [
  { value: 'PREPARING', label: 'Preparing', icon: '🥣' },
  { value: 'BAKING', label: 'Baking', icon: '🔥' },
  { value: 'COMPLETED', label: 'Completed', icon: '✅' },
];

interface Props {
  order: ProductionOrder;
  onClose: () => void;
  onUpdated: (o: ProductionOrder) => void;
}

export default function UpdatePhaseModal({ order, onClose, onUpdated }: Props) {
  const [phase, setPhase] = useState<Phase>(order.phase);
  const [progress, setProgress] = useState(order.progressPercent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const updated = await kitchenApi.updatePhase(order.id, { phase, progressPercent: progress });
      onUpdated(updated);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update phase');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="animate-scale-in bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Update Phase</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Phase</label>
            <div className="grid grid-cols-3 gap-2">
              {PHASES.map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPhase(p.value);
                    if (p.value === 'COMPLETED') setProgress(100);
                    else if (p.value === 'PREPARING' && progress > 40) setProgress(25);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    phase === p.value
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
              Progress — <span className="text-orange-400">{progress}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-600 font-mono mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-400 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving…' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
