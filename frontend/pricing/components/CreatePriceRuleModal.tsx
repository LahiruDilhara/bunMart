'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { priceRuleService } from '../services/priceRuleService';
import { PriceRule } from '../models/PriceRule';

const priceRuleSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
  currencyCode: z.string().min(1, 'Currency is required'),
  isActive: z.boolean(),
});

type PriceRuleFormData = z.infer<typeof priceRuleSchema>;

interface CreatePriceRuleModalProps {
  onClose: () => void;
  initialData?: PriceRule | null;
}

// Currency options with LKR as the first and default option
const currencyOptions = [
  { value: 'LKR', label: 'LKR - Sri Lankan Rupee', symbol: 'Rs' },
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
];

export function CreatePriceRuleModal({ onClose, initialData }: CreatePriceRuleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PriceRuleFormData>({
    resolver: zodResolver(priceRuleSchema),
    defaultValues: initialData ? {
      productId: initialData.productId,
      unitPrice: initialData.unitPrice,
      currencyCode: initialData.currencyCode || 'LKR',
      isActive: initialData.isActive ?? true,
    } : {
      productId: '',
      unitPrice: 0,
      currencyCode: 'LKR', // Default to LKR
      isActive: true,
    },
  });

  // Watch the selected currency to show appropriate symbol
  const selectedCurrency = watch('currencyCode');
  
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencyOptions.find(c => c.value === currencyCode);
    return currency?.symbol || 'Rs';
  };

  const getCurrencyLabel = (currencyCode: string) => {
    const currency = currencyOptions.find(c => c.value === currencyCode);
    return currency?.label || 'LKR - Sri Lankan Rupee';
  };

  const onSubmit = async (data: PriceRuleFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Saving price rule with currency:', data.currencyCode); // Debug log
      
      if (initialData?.id) {
        await priceRuleService.update(initialData.id, data);
      } else {
        await priceRuleService.create(data);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to save price rule. Please try again.');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2d2417] rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-[#181511] dark:text-white mb-4">
          {initialData ? 'Edit Price Rule' : 'Create New Price Rule'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">Product ID</label>
            <input
              {...register('productId')}
              className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              placeholder="Enter product ID"
            />
            {errors.productId && (
              <p className="mt-1 text-xs text-red-500">{errors.productId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">
              Currency <span className="text-xs text-primary">(LKR is default)</span>
            </label>
            <select
              {...register('currencyCode')}
              className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
            >
              {currencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedCurrency === 'LKR' && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ Using Sri Lankan Rupees (LKR)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">
              Unit Price {selectedCurrency === 'LKR' ? '(LKR)' : `(${selectedCurrency})`}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-[#8a7960] font-medium">
                {getCurrencySymbol(selectedCurrency)}
              </span>
              <input
                {...register('unitPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
                placeholder={`0.00 ${selectedCurrency}`}
              />
            </div>
            {errors.unitPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.unitPrice.message}</p>
            )}
            {selectedCurrency === 'LKR' && (
              <p className="mt-1 text-xs text-gray-500">
                Example: Rs 1,000.00 for one thousand rupees
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="rounded border-primary/20 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[#181511] dark:text-white">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-[#3a3124] border border-primary/20 rounded-lg text-sm font-bold text-[#181511] dark:text-white hover:bg-background-light dark:hover:bg-[#4d4234] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : initialData ? 'Update Price Rule' : 'Create Price Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}