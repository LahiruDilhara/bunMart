"use client";

import Image from "next/image";

type OrderItem = {
    productId: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl?: string;
    description?: string;
    unit?: string;
};

type OrderItemsListProps = {
    items: OrderItem[];
};

export function OrderItemsList({ items }: OrderItemsListProps) {
    const fallbackImg = "/images/mock-product.png";

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="font-bold text-2xl text-foreground dark:text-white">
                    Order Items ({items.length})
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div
                        key={item.productId}
                        className="bg-white dark:bg-card-dark p-4 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                                <Image
                                    src={item.imageUrl || fallbackImg}
                                    alt={item.name ?? "Product"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        {item.name ?? `Product ${item.productId}`}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {item.description ? `${item.description} • ` : ""}{item.unit ?? "Pack"}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-xs font-bold text-primary bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                        Qty: {item.quantity}
                                    </span>
                                    <span className="font-extrabold text-lg text-foreground dark:text-white">
                                        ${item.lineTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
