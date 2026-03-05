'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../models/Campaign';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean(),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CreateCampaignModalProps {
  onClose: () => void;
  initialData?: Campaign | null;
}

export function CreateCampaignModal({ onClose, initialData }: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      startDate: formatDateForInput(initialData.startDate),
      endDate: formatDateForInput(initialData.endDate),
      isActive: initialData.isActive ?? true,
    } : {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (initialData?.id) {
        await campaignService.update(initialData.id, data);
      } else {
        await campaignService.create(data);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to save campaign. Please try again.');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2d2417] rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-[#181511] dark:text-white mb-4">
          {initialData ? 'Edit Campaign' : 'Create New Campaign'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">Campaign Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              placeholder="Enter campaign name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8a7960] mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              placeholder="Enter campaign description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#8a7960] mb-1">Start Date</label>
              <input
                {...register('startDate')}
                type="datetime-local"
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#8a7960] mb-1">End Date</label>
              <input
                {...register('endDate')}
                type="datetime-local"
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary"
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="campaignIsActive"
              className="rounded border-primary/20 text-primary focus:ring-primary"
            />
            <label htmlFor="campaignIsActive" className="text-sm font-medium text-[#181511] dark:text-white">
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
              {loading ? 'Saving...' : initialData ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}