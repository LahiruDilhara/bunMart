"use client";

import { MapPin, CreditCard, ExternalLink } from "lucide-react";

type OrderDetailsProps = {
    address: {
        name: string;
        addressLine1: string;
        addressLine2: string;
        country: string;
        phoneNumber: string;
    };
    payment: {
        brand: string;
        last4: string;
    };
};

export function OrderShippingAddress({ address }: Pick<OrderDetailsProps, "address">) {
    return (
        <div className="bg-white dark:bg-background-dark border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-foreground dark:text-white">Shipping Address</h3>
            </div>
            <div className="text-sm space-y-1">
                <p className="font-bold text-foreground dark:text-white">{address.name}</p>
                <p className="text-muted">{address.addressLine1}</p>
                <p className="text-muted">{address.addressLine2}</p>
                <p className="text-muted">{address.country}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Phone Number
                </p>
                <p className="text-sm text-foreground dark:text-white">{address.phoneNumber}</p>
            </div>
        </div>
    );
}

export function OrderPaymentMethod({ payment }: Pick<OrderDetailsProps, "payment">) {
    return (
        <div className="bg-white dark:bg-background-dark border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-foreground dark:text-white">Payment Method</h3>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md font-bold text-sm text-foreground dark:text-white border border-border shadow-sm">
                    {payment.brand}
                </div>
                <p className="text-sm text-muted">Ending in {payment.last4}</p>
            </div>
        </div>
    );
}

export function OrderMap() {
    return (
        <div className="relative h-48 sm:h-auto sm:aspect-video rounded-xl overflow-hidden border border-border mt-6">
            {/* Fallback map background pattern */}
            <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#202124] bg-[url('https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-multiply" />

            {/* Map Content Fake */}
            <div className="absolute bottom-4 left-4">
                <button className="flex items-center gap-2 bg-white dark:bg-background-dark px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Tracking Map
                </button>
            </div>
        </div>
    );
}
