'use client';
import { useState, useEffect, useCallback } from 'react';
import { ProductionOrder } from '@/types/kitchen';
import { kitchenApi } from '@/lib/api';
import KanbanBoard from '@/components/kitchen/KanbanBoard';
import StatsBar from '@/components/kitchen/StatsBar';
import { RefreshCw, ChefHat } from 'lucide-react';

type ViewMode = 'kanban' | 'list';
type FilterPhase = 'ALL' | 'PREPARING' | 'BAKING' | 'COMPLETED';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterPhase>('ALL');
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const data = await kitchenApi.getAllOrders();
      setOrders(data);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  function handleUpdated(updated: ProductionOrder) {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  }

  function handleDeleted(id: string) {
    setOrders(prev => prev.filter(o => o.id !== id));
  }

  const filtered = orders.filter(o => {
    if (filter !== 'ALL' && o.phase !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.userOrderId.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.lines.some(l => l.productId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white-200">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center glow-orange">
              <ChefHat className="text-orange-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">Kitchen Dashboard</h1>
              <p className="text-sm text-gray-500 font-mono">
                BunMart · Last updated{' '}
                {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        {!loading && !error && <StatsBar orders={orders} />}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, product…"
            className="flex-1 bg-gray-200 border border-white/10 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors font-mono"
          />
          <div className="flex gap-2">
            {(['ALL', 'PREPARING', 'BAKING', 'COMPLETED'] as FilterPhase[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-white/5 rounded-lg w-32 animate-pulse" />
                {[1, 2].map(j => (
                  <div key={j} className="bg-gray-50 border border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-2 bg-white/5 rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-white/500 rounded-lg w-20" />
                      <div className="h-6 bg-white/500 rounded-lg w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <p className="text-4xl">⚠️</p>
              <p className="text-red-400 font-semibold">{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-2">
              <p className="text-4xl">🍽️</p>
              <p className="text-gray-400 font-semibold">No orders found</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <KanbanBoard orders={filtered} onUpdated={handleUpdated} onDeleted={handleDeleted} />
        )}
      </div>
    </div>
  );
}
