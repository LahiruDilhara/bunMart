'use client';

import { useState, useEffect } from 'react';
import { discountService } from '../../service/discountService';
import { campaignService } from '../../service/campaignService';
import { DiscountRule } from '../../models/DiscountRule';
import { Campaign } from '../../models/Campaign';
import { DiscountForm } from './DiscountForm';

export function DiscountList() {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountRule | null>(null);

  useEffect(() => {
    Promise.all([loadDiscounts(), loadCampaigns()]);
  }, []);

  const loadDiscounts = async () => {
    try {
      const data = await discountService.getAll();
      setDiscounts(data);
    } catch (error) {
      console.error('Failed to load discounts:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await campaignService.getAll();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this discount rule?')) {
      try {
        await discountService.delete(id);
        await loadDiscounts();
      } catch (error) {
        console.error('Failed to delete discount:', error);
      }
    }
  };

  const handleEdit = (discount: DiscountRule) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDiscount(null);
    loadDiscounts();
  };

  const getCampaignName = (campaignId?: number) => {
    if (!campaignId) return '-';
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.name || `ID: ${campaignId}`;
  };

  return (
    <div className="bg-white dark:bg-[#2d2417] rounded-xl border border-primary/10 shadow-sm">
      <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#181511] dark:text-white">Discount Rules</h2>
        <button
          onClick={() => {
            setEditingDiscount(null);
            setShowForm(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors"
        >
          + New Discount Rule
        </button>
      </div>

      {showForm && (
        <div className="p-6 border-b border-primary/10">
          <DiscountForm
            initialData={editingDiscount}
            campaigns={campaigns}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingDiscount(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-[#8a7960]">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-[#8a7960] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {discounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-primary/5">
                  <td className="px-6 py-4 text-sm font-mono text-[#181511] dark:text-white">{discount.productId || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#8a7960]">{getCampaignName(discount.campaignId)}</td>
                  <td className="px-6 py-4 text-sm text-[#8a7960]">{discount.type}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#8a7960] max-w-xs truncate">{discount.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      discount.isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="text-primary hover:text-[#d9830b] text-sm font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => discount.id && handleDelete(discount.id)}
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
  );
}