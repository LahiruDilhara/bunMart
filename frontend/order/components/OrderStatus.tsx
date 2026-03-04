"use client";

import { CheckCircle2, Truck } from "lucide-react";

export function OrderStatus() {
    return (
        <div className="bg-white dark:bg-background-dark border border-border rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6 text-foreground dark:text-white">
                Order Status
            </h2>
            <div className="relative border-l border-border ml-3 space-y-8">

                {/* Placed */}
                <div className="relative pl-6">
                    <span className="absolute -left-[13px] top-1 bg-white dark:bg-background-dark">
                        <CheckCircle2 className="w-6 h-6 text-orange-500 fill-orange-100 dark:fill-orange-900/30" />
                    </span>
                    <h3 className="text-foreground dark:text-white font-semibold">Order Placed</h3>
                    <p className="text-muted text-sm mt-1">Oct 24, 10:00 AM • We&apos;ve received your artisanal bun order.</p>
                </div>

                {/* Processing */}
                <div className="relative pl-6">
                    <span className="absolute -left-[13px] top-1 bg-white dark:bg-background-dark">
                        <CheckCircle2 className="w-6 h-6 text-orange-500 fill-orange-100 dark:fill-orange-900/30" />
                    </span>
                    <h3 className="text-foreground dark:text-white font-semibold">Processing</h3>
                    <p className="text-muted text-sm mt-1">Oct 24, 02:30 PM • Your items are being hand-packed with care.</p>
                </div>

                {/* Shipped */}
                <div className="relative pl-6">
                    <span className="absolute -left-[13px] top-1 bg-white dark:bg-background-dark">
                        <div className="w-6 h-6 flex items-center justify-center bg-orange-500 rounded-full text-white">
                            <Truck className="w-3.5 h-3.5" />
                        </div>
                    </span>
                    <h3 className="text-foreground dark:text-white font-semibold">Shipped</h3>
                    <p className="text-muted text-sm mt-1">Oct 25, 09:00 AM • Courier: FastBake (Tracking: FB8829302)</p>
                </div>

            </div>
        </div>
    );
}
