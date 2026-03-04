"use client";

import { Download, RotateCcw, Truck } from "lucide-react";

type OrderHeaderProps = {
    orderId: string;
    datePlaced: string;
};

export function OrderHeader({ orderId, datePlaced }: OrderHeaderProps) {
    const formattedDate = new Date(datePlaced).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const formattedTime = new Date(datePlaced).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground dark:text-white">
                        Order #{orderId}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Truck className="w-3 h-3" />
                        Shipped
                    </span>
                </div>
                <p className="text-muted text-sm">
                    Placed on {formattedDate} • {formattedTime}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    Reorder Everything
                </button>
                <button className="flex items-center justify-center border border-border bg-white dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground dark:text-white p-2.5 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
