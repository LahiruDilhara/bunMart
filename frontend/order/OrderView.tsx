"use client";

import { mockOrderData } from "./mockData";
import {
    OrderBreadcrumbs,
    OrderHeader,
    OrderStatus,
    OrderItemsList,
    OrderSummary,
    OrderShippingAddress,
    OrderPaymentMethod,
    OrderMap,
   
} from "./components";

type OrderViewProps = {
    orderId: string;
};

export function OrderView({ orderId }: OrderViewProps) {
    // Use mock data since no backend connection is required for this route yet.
    const data = mockOrderData;

    // Use the ID from the URL or fallback to the mock ID if it doesn't match
    const displayId = orderId || data.id;

    return (
        <main className="flex-1 flex flex-col px-4 md:px-10 lg:px-40 py-8 bg-white dark:bg-background-dark text-foreground dark:text-white pb-32">
            <OrderBreadcrumbs orderId={displayId} />

            <OrderHeader orderId={displayId} datePlaced={data.datePlaced} />

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Column (Main Details) */}
                <div className="flex-1 flex flex-col">
                    <OrderStatus />
                    <OrderItemsList items={data.items} />
                </div>

                {/* Right Column (Sidebar Summary) */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                    <OrderSummary summary={data.summary} />

                    <div className="flex flex-col gap-6">
                        <OrderShippingAddress address={data.shippingAddress} />
                        <OrderPaymentMethod payment={data.paymentMethod} />
                        <OrderMap />
                    </div>
                </div>

            </div>
        </main>
    );
}
