"use client";

interface ProfilePageHeadingProps {
  userName: string;
  onNewOrder: () => void;
}

export function ProfilePageHeading({ userName, onNewOrder }: ProfilePageHeadingProps) {
  const firstName = userName.split(" ")[0];
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 px-4 lg:px-0">
      <div className="flex flex-col gap-1">
        <p className="text-[#181511] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Welcome back, {firstName}!</p>
        <p className="text-[#8a7960] dark:text-stone-400 text-base font-normal leading-normal">Manage your artisanal bun subscriptions and account details.</p>
      </div>
      <button onClick={onNewOrder} className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer">
        <span className="material-symbols-outlined">add</span>
        New Order
      </button>
    </div>
  );
}