'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { couponService } from '../services/couponService';
import { Coupon } from '../models/Coupon';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  description: z.string().optional(),
  minOrderAmount: z.number().min(0),
  usageLimit: z.number().min(0),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  isActive: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CreateCouponModalProps {
  onClose: () => void;
  initialData?: Coupon | null;
}

export function CreateCouponModal({ onClose, initialData }: CreateCouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData ? {
      code: initialData.code || '',
      type: (initialData.type as 'PERCENTAGE' | 'FIXED') || 'PERCENTAGE',
      value: initialData.value || 0,
      description: initialData.description || '',
      minOrderAmount: initialData.minOrderAmount || 0,
      usageLimit: initialData.usageLimit || 0,
      expiresAt: formatDateForInput(initialData.expiresAt?.toString()),
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

  const getCurrencySymbol = () => 'Rs'; // Default to LKR for fixed amounts

  const onSubmit: SubmitHandler<CouponFormData> = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API
      const apiData = {
        ...data,
        expiresAt: new Date(data.expiresAt).toISOString(),
      };
      
      if (initialData?.id) {
        await couponService.update(initialData.id, apiData);
      } else {
        await couponService.create(apiData);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to save coupon. Please try again.');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2d2417] rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-[#181511] dark:text-white mb-4">
          {initialData ? 'Edit Coupon' : 'Create New Coupon'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
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
              <label className="block text-sm font-bold text-[#8a7960] mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (LKR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#8a7960] mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {couponType === 'FIXED' && (
                  <span className="absolute left-3 top-2 text-[#8a7960]">{getCurrencySymbol()}</span>
                )}
                <input
                  {...register('value', { valueAsNumber: true })}
                  type="number"
                  step={couponType === 'PERCENTAGE' ? '1' : '0.01'}
                  min="0.01"
                  className={`w-full ${couponType === 'FIXED' ? 'pl-8' : 'pl-4'} pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary`}
                  placeholder={couponType === 'PERCENTAGE' ? '10' : '500.00'}
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
              <label className="block text-sm font-bold text-[#8a7960] mb-1">Min Order Amount (LKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#8a7960]">Rs</span>
                <input
                  {...register('minOrderAmount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="0.00"
                />
              </div>
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
            <label className="block text-sm font-bold text-[#8a7960] mb-1">
              Expiration Date <span className="text-red-500">*</span>
            </label>
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
              {loading ? 'Saving...' : initialData ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}