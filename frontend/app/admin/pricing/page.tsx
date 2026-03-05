'use client';

import { useState, useEffect } from 'react';
import { PriceRulesTable } from '@/pricing/components/PriceRulesTable';
import { CampaignsTable } from '@/pricing/components/CampaignsTable';
import { CouponsTable } from '@/pricing/components/CouponsTable';
import { DiscountsTable } from '@/pricing/components/DiscountsTable';
import { api } from '@/service/api';


export default function PricingAdminPage() {
  const [activeTab, setActiveTab] = useState<'prices' | 'campaigns' | 'coupons' | 'discounts'>('prices');
  const [grpcStatus, setGrpcStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [restStatus, setRestStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // Check REST connection
    try {
      await api.get('/campaigns', { timeout: 2000 });
      setRestStatus('connected');
      console.log('✅ REST API connected on port 8080');
    } catch (error) {
      console.log('❌ REST API not connected on port 8080');
      setRestStatus('disconnected');
    }

    // Check gRPC connection
  //   try {
  //     // Simple health check or test call to gRPC
  //     // You might need to implement a simple health check in your gRPC service
  //     const response = await pricingGrpcClient.healthCheck();
  //     if (response) {
  //       setGrpcStatus('connected');
  //       console.log('✅ gRPC connected on port 9093');
  //     } else {
  //       setGrpcStatus('disconnected');
  //     }
  //   } catch (error) {
  //     console.log('❌ gRPC not connected on port 9093');
  //     setGrpcStatus('disconnected');
  //   }
  // };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'connected': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'disconnected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#2d2417] border-b border-primary/10">
        <div className="px-6 md:px-10 lg:px-40 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* BunMart Logo */}
              <div className="size-8 text-primary">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181511] dark:text-white">Pricing Administration</h1>
                <p className="text-sm text-[#8a7960]">Manage price rules, campaigns, coupons, and discounts</p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3">
              {/* gRPC Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(grpcStatus)}`}>
                <span>{getStatusIcon(grpcStatus)}</span>
                <span>gRPC (9093)</span>
              </div>
              
              {/* REST Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(restStatus)}`}>
                <span>{getStatusIcon(restStatus)}</span>
                <span>REST (8080)</span>
              </div>
              
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Admin</span>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <a href="#" className="text-[#8a7960] text-sm font-medium hover:text-primary">Home</a>
            <span className="text-[#8a7960] text-sm font-medium">/</span>
            <span className="text-[#181511] dark:text-white text-sm font-bold">Pricing Admin</span>
          </div>

          {/* Status Messages */}
          {grpcStatus === 'disconnected' && restStatus === 'disconnected' && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                <span>❌</span>
                <span>Both gRPC and REST connections failed. Make sure your backend is running:</span>
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                <li>gRPC server on port <span className="font-mono font-bold">9093</span></li>
                <li>REST server on port <span className="font-mono font-bold">8080</span></li>
              </ul>
            </div>
          )}

          {grpcStatus === 'disconnected' && restStatus === 'connected' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>gRPC connection failed. REST is working, but some features may be limited.</span>
              </p>
            </div>
          )}

          {grpcStatus === 'connected' && restStatus === 'disconnected' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>REST connection failed. gRPC is working, but some features may be limited.</span>
              </p>
            </div>
          )}

          {grpcStatus === 'connected' && restStatus === 'connected' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                <span>✅</span>
                <span>Both gRPC and REST connections are active. All features available.</span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-10 lg:px-40 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-primary/10">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('prices')}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === 'prices'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#8a7960] hover:text-[#181511] dark:hover:text-white'
              }`}
            >
              Price Rules
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === 'campaigns'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#8a7960] hover:text-[#181511] dark:hover:text-white'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === 'coupons'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#8a7960] hover:text-[#181511] dark:hover:text-white'
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === 'discounts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#8a7960] hover:text-[#181511] dark:hover:text-white'
              }`}
            >
              Discount Rules
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'prices' && <PriceRulesTable />}
          {activeTab === 'campaigns' && <CampaignsTable />}
          {activeTab === 'coupons' && <CouponsTable />}
          {activeTab === 'discounts' && <DiscountsTable />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-primary/10 py-6 text-center">
        <p className="text-[#8a7960] text-sm">© 2026 BunMart Artisanal Bakeries. All rights reserved.</p>
      </footer>
    </div>
  );
}
}