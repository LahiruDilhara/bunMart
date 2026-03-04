'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { priceRuleService } from '../../service/priceRuleService';
import { PriceRule } from '../../models/PriceRule';

const priceRuleSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
  currencyCode: z.string().default('USD'),
  isActive: z.boolean().default(true),
});

type PriceRuleFormData = z.infer<typeof priceRuleSchema>;

interface PriceRuleFormProps {
  initialData?: PriceRule | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PriceRuleForm({ initialData, onSuccess, onCancel }: PriceRuleFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PriceRuleFormData>({
    resolver: zodResolver(priceRuleSchema),
    defaultValues: initialData ? {
      productId: initialData.productId,
      unitPrice: initialData.unitPrice,
      currencyCode: initialData.currencyCode || 'USD',
      isActive: initialData.isActive ?? true,
    } : {
      productId: '',
      unitPrice: 0,
      currencyCode: 'USD',
      isActive: true,
    },
  });

  const onSubmit = async (data: PriceRuleFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (initialData?.id) {
        await priceRuleService.update(initialData.id, data);
      } else {
        await priceRuleService.create(data);
      }
      
      onSuccess();
    } catch (err) {
      setError('Failed to save price rule. Please try again.');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Unit Price</label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-[#8a7960]">$</span>
          <input
            {...register('unitPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full pl-8 pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
            placeholder="0.00"
          />
        </div>
        {errors.unitPrice && (
          <p className="mt-1 text-xs text-red-500">{errors.unitPrice.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Currency</label>
        <select
          {...register('currencyCode')}
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
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
          onClick={onCancel}
          className="px-4 py-2 bg-white dark:bg-[#3a3124] border border-primary/20 rounded-lg text-sm font-bold text-[#181511] dark:text-white hover:bg-background-light dark:hover:bg-[#4d4234] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}