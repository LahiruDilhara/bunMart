"use client";

import Link from "next/link";

interface TopNavBarProps {
  avatarUrl?: string;
}

export function TopNavBar({ avatarUrl }: TopNavBarProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-stone-100 dark:border-stone-800 bg-white dark:bg-background-dark px-4 md:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-4 text-[#181511] dark:text-white">
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-4xl">bakery_dining</span>
          </div>
          <h2 className="text-[#181511] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            BunMart
          </h2>
        </Link>
        <div className="hidden md:flex items-center gap-9">
          <Link className="text-[#181511] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">
            Shop
          </Link>
          <Link className="text-[#181511] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="/bakeries">
            Bakeries
          </Link>
          <Link className="text-[#181511] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="/subscriptions">
            Subscriptions
          </Link>
        </div>
      </div>

      <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
        {/* Search */}
        <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#8a7960] flex border-none bg-stone-100 dark:bg-stone-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181511] dark:text-white focus:outline-0 focus:ring-0 border-none bg-stone-100 dark:bg-stone-800 focus:border-none h-full placeholder:text-[#8a7960] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search buns..."
              type="text"
            />
          </div>
        </label>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href="/cart"
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-stone-100 dark:bg-stone-800 text-[#181511] dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-stone-100 dark:bg-stone-800 text-[#181511] dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>

        {/* Avatar */}
        {avatarUrl && (
          <Link href="/profile">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary"
              role="img"
              aria-label="User profile avatar"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
