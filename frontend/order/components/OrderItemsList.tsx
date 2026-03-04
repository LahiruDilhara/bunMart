"use client";

import Image from "next/image";

type OrderItemProps = {
    item: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        imageUrl: string;
        description: string;
        unit: string;
    };
};

export function OrderItemCard({ item }: OrderItemProps) {
    // Use a fallback image if necessary, but according to mock, it has a mock image
    const fallbackImg = "/images/mock-product.png";

    return (
        <div className="flex items-center justify-between py-6 border-b border-border last:border-0 gap-4">
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    <Image
                        src={item.imageUrl || fallbackImg}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-foreground dark:text-white font-semibold text-base">
                        {item.name}
                    </h3>
                    <p className="text-muted text-sm mb-1">
                        {item.description} • {item.unit}
                    </p>
                    <p className="text-orange-500 text-sm font-medium">
                        Quantity: {item.quantity}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-foreground dark:text-white font-bold text-lg">
                    ${item.lineTotal.toFixed(2)}
                </span>
                <span className="text-muted text-xs">
                    ${item.unitPrice.toFixed(2)} each
                </span>
            </div>
        </div>
    );
}

type OrderItemsListProps = {
    items: Array<OrderItemProps["item"]>;
};

export function OrderItemsList({ items }: OrderItemsListProps) {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-white dark:bg-background-dark border border-border rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-2 text-foreground dark:text-white">
                Order Items ({totalItems})
            </h2>
            <div className="flex flex-col">
                {items.map((item) => (
                    <OrderItemCard key={item.productId} item={item} />
                ))}
            </div>
        </div>
    );
}
