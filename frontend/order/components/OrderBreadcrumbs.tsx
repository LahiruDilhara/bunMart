"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type OrderBreadcrumbsProps = {
    orderId: string;
};

export function OrderBreadcrumbs({ orderId }: OrderBreadcrumbsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 py-4">
            <Link
                href="/"
                className="text-muted text-sm font-medium hover:text-primary transition-colors"
            >
                Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted" />
            <span className="text-muted text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                My Orders
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
            <span className="text-foreground dark:text-white text-sm font-medium">
                Order #{orderId}
            </span>
        </div>
    );
}
