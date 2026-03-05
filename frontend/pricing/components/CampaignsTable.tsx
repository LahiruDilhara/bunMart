'use client';

import { useState, useEffect } from 'react';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../models/Campaign';
import { CreateCampaignModal } from './CreateCampaignModal';

export function CampaignsTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading campaigns...');
      const data = await campaignService.getAll();
      console.log('Campaigns loaded:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        console.error('Data is not an array:', data);
        setCampaigns([]);
        setError('Received invalid data format from server');
      }
    } catch (error: any) {
      console.error('Failed to load campaigns:', error);
      setError(error?.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.delete(id);
        await loadCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCampaign(null);
    loadCampaigns();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2d2417] rounded-xl border border-primary/10 shadow-sm p-8">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-[#8a7960] mb-4">{error}</p>
          <button
            onClick={loadCampaigns}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#2d2417] rounded-xl border border-primary/10 shadow-sm">
        <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#181511] dark:text-white">Campaigns</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d9830b] transition-colors"
          >
            + New Campaign
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-[#8a7960] mt-2">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-[#8a7960]">
            No campaigns found. Click "New Campaign" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#8a7960] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#8a7960] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{campaign.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#181511] dark:text-white">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-[#8a7960] max-w-xs truncate">{campaign.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{formatDate(campaign.startDate)}</td>
                    <td className="px-6 py-4 text-sm text-[#8a7960]">{formatDate(campaign.endDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        campaign.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="text-primary hover:text-[#d9830b] text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => campaign.id && handleDelete(campaign.id)}
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
        <CreateCampaignModal
          onClose={handleModalClose}
          initialData={editingCampaign}
        />
      )}
    </>
  );
}