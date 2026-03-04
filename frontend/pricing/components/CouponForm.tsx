'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { couponService } from '../../service/couponService';
import { Coupon } from '../../models/Coupon';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  description: z.string().optional(),
  minOrderAmount: z.number().min(0).default(0),
  usageLimit: z.number().min(0).default(0),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  isActive: z.boolean().default(true),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  initialData?: Coupon | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CouponForm({ initialData, onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData ? {
      code: initialData.code,
      type: initialData.type as 'PERCENTAGE' | 'FIXED',
      value: initialData.value,
      description: initialData.description || '',
      minOrderAmount: initialData.minOrderAmount || 0,
      usageLimit: initialData.usageLimit || 0,
      expiresAt: formatDateForInput(initialData.expiresAt),
      isActive: initialData.isActive ?? true,
    } : {
      code: '',
      type: 'PERCENTAGE',
      value: 0,
      description: '',
      minOrderAmount: 0,
      usageLimit: 0,
      expiresAt: '',
      isActive: true,
    },
  });

  const couponType = watch('type');

  const onSubmit = async (data: CouponFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const couponData = {
        ...data,
        expiresAt: new Date(data.expiresAt),
      };
      
      if (initialData?.id) {
        await couponService.update(initialData.id, couponData);
      } else {
        await couponService.create(couponData);
      }
      
      onSuccess();
    } catch (err) {
      setError('Failed to save coupon. Please try again.');
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
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Coupon Code</label>
        <input
          {...register('code')}
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary uppercase"
          placeholder="e.g., SUMMER20"
        />
        {errors.code && (
          <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
        )}
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
            {couponType === 'FIXED' && (
              <span className="absolute left-3 top-2 text-[#8a7960]">$</span>
            )}
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              step={couponType === 'PERCENTAGE' ? '1' : '0.01'}
              className={`w-full ${couponType === 'FIXED' ? 'pl-8' : 'pl-4'} pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary`}
              placeholder={couponType === 'PERCENTAGE' ? '10' : '5.00'}
            />
            {couponType === 'PERCENTAGE' && (
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
          placeholder="Brief description of the coupon"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#8a7960] mb-1">Min Order Amount ($)</label>
          <input
            {...register('minOrderAmount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#8a7960] mb-1">Usage Limit</label>
          <input
            {...register('usageLimit', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
            placeholder="0 = unlimited"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#8a7960] mb-1">Expiration Date</label>
        <input
          {...register('expiresAt')}
          type="datetime-local"
          className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
        />
        {errors.expiresAt && (
          <p className="mt-1 text-xs text-red-500">{errors.expiresAt.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          {...register('isActive')}
          type="checkbox"
          id="couponIsActive"
          className="rounded border-primary/20 text-primary focus:ring-primary"
        />
        <label htmlFor="couponIsActive" className="text-sm font-medium text-[#181511] dark:text-white">
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