"use client";

import Link from "next/link";

export function BackToBakeryLink() {
  return (
    <div className="pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary font-bold hover:underline transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to the Bakery
      </Link>
    </div>
  );
}
