"use client";

import { useState, useEffect } from "react";
import { getOrder } from "@/service/orderService";
import type { Order } from "@/models/order";
import {
    OrderHeader,
    OrderStatusBadge,
    OrderStatus,
    OrderItemsList,
    OrderSummary,
    OrderShippingCard,
} from "./components";

type OrderViewProps = {
    orderId: string;
};

export function OrderView({ orderId }: OrderViewProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await getOrder(orderId);
                setOrder(data);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch order:", err);
                setError(err.message ?? "Could not load order details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <main className="flex-1 flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-muted font-medium text-sm">Loading order details…</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-20 text-foreground dark:text-white">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">error_outline</span>
                <p className="text-xl font-semibold mb-4">{error || "Order not found"}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Try Again
                </button>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto w-full px-6 py-10">
            {/* Header: breadcrumb + title + action buttons */}
            <OrderHeader
                orderId={order.id}
                datePlaced={order.datePlaced}
                status={order.status}
            />

            {/* Main 12-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── Left Column (8 cols) ───────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Status card + Tracking timeline (side by side on md+) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order total + status badge */}
                        <div className="bg-white dark:bg-card-dark p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                            <OrderStatusBadge status={order.status} />
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-4">Order Total</p>
                            <p className="text-5xl font-black text-primary tracking-tight">
                                ${order.summary.total.toFixed(2)}
                            </p>
                            <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Placed on{" "}
                                {new Date(order.datePlaced).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        {/* Tracking History timeline */}
                        <OrderStatus
                            status={order.status}
                            datePlaced={order.datePlaced}
                            shipmentId={order.shipmentId}
                            trackingHistory={order.trackingHistory}
                        />
                    </div>

                    {/* Shipping address + Map */}
                    {order.shippingAddress && (
                        <OrderShippingCard address={order.shippingAddress} />
                    )}

                    {/* Order items grid */}
                    <OrderItemsList items={order.items} />
                </div>

                {/* ── Right Column (4 cols) — Sticky Sidebar ────────────── */}
                <aside className="lg:col-span-4 space-y-6">
                    <OrderSummary
                        orderId={order.id}
                        status={order.status}
                        datePlaced={order.datePlaced}
                        summary={order.summary}
                        paymentMethod={order.paymentMethod}
                    />
                </aside>
            </div>
        </main>
    );
}
