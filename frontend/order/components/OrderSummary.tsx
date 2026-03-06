"use client";

import { cancelOrder } from "@/service/orderService";
import { useState } from "react";

type OrderSummaryProps = {
    orderId: string;
    status: string;
    datePlaced: string;
    summary: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    paymentMethod?: {
        brand: string;
        last4: string;
    };
};

export function OrderSummary({ orderId, status, datePlaced, summary, paymentMethod }: OrderSummaryProps) {
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    const formattedDate = new Date(datePlaced).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const isCancellable = !["DELIVERED", "CANCELLED", "CANCELED"].includes(status?.toUpperCase() ?? "");

    async function handleCancel() {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        setCancelling(true);
        try {
            await cancelOrder(orderId);
            setCancelled(true);
            window.location.reload();
        } catch (err) {
            alert("Failed to cancel order. Please try again.");
        } finally {
            setCancelling(false);
        }
    }

    const stateTax = summary.subtotal * 0.045;
    const cityTax = summary.subtotal * 0.012;

    return (
        <div className="bg-white dark:bg-card-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-28">
            <h2 className="font-bold text-lg uppercase tracking-wider text-slate-400 mb-6">
                Order Summary
            </h2>

            {/* Order total highlight */}
            <div className="mb-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Order Total</p>
                <p className="text-5xl font-black text-primary tracking-tight">${summary.total.toFixed(2)}</p>
                <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Placed on {formattedDate}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                    <span className="font-bold">${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Shipping (Express)</span>
                    <span className="font-bold text-green-500">${summary.shipping.toFixed(2)}</span>
                </div>

                {/* Tax Breakdown */}
                <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Tax Breakdown
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">State Tax (4.5%)</span>
                            <span className="font-bold">${stateTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">City Tax (1.2%)</span>
                            <span className="font-bold">${cityTax.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xl font-bold text-foreground dark:text-white">Total Amount</span>
                    <span className="text-3xl font-black text-primary tracking-tight">${summary.total.toFixed(2)}</span>
                </div>

                {/* Payment Method */}
                {paymentMethod && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">credit_card</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Payment</p>
                                    <p className="text-sm font-bold">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                    </div>
                )}

                {/* Support & Actions */}
                <div className="mt-6 space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <h3 className="text-sm font-bold mb-1 text-foreground dark:text-white">Need assistance?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                            Our artisanal bakers are here to help you with your fresh delivery.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="bg-white dark:bg-slate-800 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-sm text-primary">chat_bubble</span>
                                Support
                            </button>
                            <button className="bg-white dark:bg-slate-800 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-sm text-primary">undo</span>
                                Return
                            </button>
                        </div>
                    </div>

                    {isCancellable && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling || cancelled}
                            className="w-full py-4 text-red-500 text-sm font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                        >
                            {cancelling ? "Cancelling…" : "Cancel Order"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
