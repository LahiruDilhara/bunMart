"use client";

import Link from "next/link";

export function CartBreadcrumbs() {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      <Link
        href="/"
        className="text-muted text-sm font-medium hover:text-primary transition-colors"
      >
        Home
      </Link>
      <span className="text-muted text-sm font-medium">/</span>
      <span className="text-foreground dark:text-white text-sm font-medium">
        Shopping Cart
      </span>
    </div>
  );
}
