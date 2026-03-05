'use client';
import { ProductionOrder } from '@/types/kitchen';

interface Props {
  orders: ProductionOrder[];
}

export default function StatsBar({ orders }: Props) {
  const total = orders.length;
  const preparing = orders.filter(o => o.phase === 'PREPARING').length;
  const baking = orders.filter(o => o.phase === 'BAKING').length;
  const completed = orders.filter(o => o.phase === 'COMPLETED').length;
  const avgProgress =
    total > 0 ? Math.round(orders.reduce((s, o) => s + o.progressPercent, 0) / total) : 0;
  const urgent = orders.filter(
    o => o.phase !== 'COMPLETED' && Date.now() - new Date(o.createdAt).getTime() > 20 * 60 * 1000
  ).length;

  const stats = [
    { label: 'Total Orders', value: total, color: 'text-black' },
    { label: 'Preparing', value: preparing, color: 'text-yellow-400' },
    { label: 'Baking', value: baking, color: 'text-orange-400' },
    { label: 'Completed', value: completed, color: 'text-green-400' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, color: 'text-blue-400' },
    { label: 'Urgent', value: urgent, color: urgent > 0 ? 'text-red-400' : 'text-gray-600' },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-white-200 border border-white/8 rounded-xl px-4 py-3 text-center">
          <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-600 uppercase tracking-wider mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
