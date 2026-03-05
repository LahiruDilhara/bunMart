'use client';

import { useState, useEffect } from 'react';
import { couponService } from '../services/couponService';
import { Coupon } from '../models/Coupon';
import { CreateCouponModal } from './CreateCouponModal';

export function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.delete(id);
        await loadCoupons();
      } catch (error) {
        console.error('Failed to delete coupon:', error);
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCoupon(null);
    loadCoupons();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white dark:bg-[#2d2417] rounded-xl border border-primary/10 shadow-sm">
        <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#181511] dark:text-white">Coupons</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors"
          >
            + New Coupon
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#8a7960]">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Min Order</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#8a7960] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{coupon.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#181511] dark:text-white font-mono">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{coupon.type}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">
                      {coupon.minOrderAmount ? `$${coupon.minOrderAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">
                      {coupon.usedCount || 0}/{coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{formatDate(coupon.expiresAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        coupon.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-primary hover:text-[#d9830b] text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => coupon.id && handleDelete(coupon.id)}
                        className="text-red-500 hover:text-red-600 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateCouponModal
          onClose={handleModalClose}
          initialData={editingCoupon}
        />
      )}
    </>
  );
}
