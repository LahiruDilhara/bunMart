'use client';

import { useState, useEffect } from 'react';
import { priceRuleService } from '../services/priceRuleService';
import { PriceRule } from '../models/PriceRule';
import { CreatePriceRuleModal } from './CreatePriceRuleModal';

export function PriceRulesTable() {
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);

  useEffect(() => {
    loadPriceRules();
  }, []);

  const loadPriceRules = async () => {
    try {
      setLoading(true);
      const data = await priceRuleService.getAll();
      setPriceRules(data);
    } catch (error) {
      console.error('Failed to load price rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this price rule?')) {
      try {
        await priceRuleService.delete(id);
        await loadPriceRules();
      } catch (error) {
        console.error('Failed to delete price rule:', error);
      }
    }
  };

  const handleEdit = (rule: PriceRule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRule(null);
    loadPriceRules();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white dark:bg-[#2d2417] rounded-xl border border-primary/10 shadow-sm">
        <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#181511] dark:text-white">Price Rules</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors"
          >
            + New Price Rule
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#8a7960] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {priceRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{rule.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#181511] dark:text-white">{rule.productId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">${rule.unitPrice}</td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{rule.currencyCode || 'USD'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{formatDate(rule.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-primary hover:text-[#d9830b] text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => rule.id && handleDelete(rule.id)}
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
        <CreatePriceRuleModal
          onClose={handleModalClose}
          initialData={editingRule}
        />
      )}
    </>
  );
}
