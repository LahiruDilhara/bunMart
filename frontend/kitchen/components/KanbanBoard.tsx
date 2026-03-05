'use client';
import { ProductionOrder, Phase } from '@/types/kitchen';
import OrderCard from './OrderCard';

const COLUMNS: { phase: Phase; label: string; icon: string; color: string }[] = [
  { phase: 'PREPARING', label: 'Preparing', icon: '🥣', color: 'text-yellow-400' },
  { phase: 'BAKING', label: 'Baking', icon: '🔥', color: 'text-orange-400' },
  { phase: 'COMPLETED', label: 'Completed', icon: '✅', color: 'text-green-400' },
];

interface Props {
  orders: ProductionOrder[];
  onUpdated: (o: ProductionOrder) => void;
  onDeleted: (id: string) => void;
}

export default function KanbanBoard({ orders, onUpdated, onDeleted }: Props) {
  const grouped = COLUMNS.map(col => ({
    ...col,
    items: orders.filter(o => o.phase === col.phase),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {grouped.map(col => (
        <div key={col.phase} className="space-y-4">
          {/* Column header */}
          <div className="flex items-center gap-2 pb-3 border-b border-white/8">
            <span className="text-xl">{col.icon}</span>
            <h2 className={`font-bold text-sm uppercase tracking-widest ${col.color}`}>{col.label}</h2>
            <span className="ml-auto font-mono text-xs text-gray-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {col.items.length === 0 ? (
              <div className="border-2 border-dashed border-white/5 rounded-2xl p-8 text-center">
                <p className="text-gray-600 text-sm">No orders</p>
              </div>
            ) : (
              col.items.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdated={onUpdated}
                  onDeleted={onDeleted}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
