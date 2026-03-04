'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { discountService } from '../../service/discountService';
import { DiscountRule } from '../../models/DiscountRule';
import { Campaign } from '../../models/Campaign';

const discountSchema = z.object({
  productId: z.string().optional(),
  campaignId: z.number().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
  initialData?: DiscountRule | null;
  campaigns: Campaign[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DiscountForm({ initialData, campaigns, onSuccess, onCancel }: DiscountFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: initialData ? {
      productId: initialData.productId || '',
      campaignId: initialData.campaignId,
      type: initialData.type as 'PERCENTAGE' | 'FIXED',
      value: initialData.value,
      description: initialData.description || '',
      isActive: initialData.isActive ?? true,
    } : {
      productId: '',
      campaignId: undefined,
      type: 'PERCENTAGE',
      value: 0,
      description: '',
      isActive: true,
    },
  });

  const discountType = watch('type');

  const onSubmit = async (data: DiscountFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (initialData?.id) {
        await discountService.update(initialData.id, data);
      } else {
        await discountService.create(data);
      }
      
      onSuccess();
    } catch (err) {
      setError('Failed to save discount rule. Please try again.');
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
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Product ID (Optional)</label>
        <input
          {...register('productId')}
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
          placeholder="Leave empty for all products"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Campaign (Optional)</label>
        <select
          {...register('campaignId', { valueAsNumber: true })}
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
        >
          <option value="">No Campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#8a7960] mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#8a7960] mb-1">Value</label>
          <div className="relative">
            {discountType === 'FIXED' && (
              <span className="absolute left-3 top-2 text-[#8a7960]">$</span>
            )}
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
              className={`w-full ${discountType === 'FIXED' ? 'pl-8' : 'pl-4'} pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary`}
              placeholder={discountType === 'PERCENTAGE' ? '10' : '5.00'}
            />
            {discountType === 'PERCENTAGE' && (
              <span className="absolute right-3 top-2 text-[#8a7960]">%</span>
            )}
          </div>
          {errors.value && (
            <p className="mt-1 text-xs text-red-500">{errors.value.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Description</label>
        <input
          {...register('description')}
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
          placeholder="Brief description of the discount"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          {...register('isActive')}
          type="checkbox"
          id="discountIsActive"
          className="rounded border-primary/20 text-primary focus:ring-primary"
        />
        <label htmlFor="discountIsActive" className="text-sm font-medium text-[#181511] dark:text-white">
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