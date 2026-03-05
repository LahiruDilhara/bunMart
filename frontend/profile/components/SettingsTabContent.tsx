"use client";

import { useState } from "react";

interface SettingsTabContentProps { userEmail: string; }

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-primary" : "bg-stone-300 dark:bg-stone-600"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export function SettingsTabContent({ userEmail }: SettingsTabContentProps) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-0">
        <h2 className="text-[#181511] dark:text-white text-2xl font-bold">Settings</h2>
        <p className="text-stone-500 text-sm mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
        <h3 className="text-base font-bold dark:text-white mb-4">Notification Preferences</h3>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium dark:text-white">Email Notifications</p><p className="text-xs text-stone-500">Receive order confirmations and updates</p></div>
            <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium dark:text-white">Order Updates</p><p className="text-xs text-stone-500">Get notified when your order status changes</p></div>
            <Toggle on={orderUpdates} onToggle={() => setOrderUpdates(!orderUpdates)} />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium dark:text-white">Promotional Emails</p><p className="text-xs text-stone-500">Receive offers, discounts, and bakery news</p></div>
            <Toggle on={promoEmails} onToggle={() => setPromoEmails(!promoEmails)} />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
        <h3 className="text-base font-bold dark:text-white mb-4">Security</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium dark:text-white">Password</p><p className="text-xs text-stone-500">Last changed 30 days ago</p></div><button className="px-4 py-2 rounded-lg text-sm font-bold border border-stone-200 dark:border-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">Change Password</button></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium dark:text-white">Two-Factor Authentication</p><p className="text-xs text-stone-500">Add extra security to your account</p></div><button className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer">Enable 2FA</button></div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-red-200 dark:border-red-900/30">
        <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium dark:text-white">Delete Account</p><p className="text-xs text-stone-500">Permanently remove your account and all data</p></div><button className="px-4 py-2 rounded-lg text-sm font-bold text-red-500 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">Delete Account</button></div>
      </div>
    </div>
  );
}