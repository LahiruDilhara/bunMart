"use client";

type ShippingAddress = {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    country: string;
    phoneNumber: string;
};

type OrderDetailsGridProps = {
    address: ShippingAddress;
};

export function OrderShippingCard({ address }: OrderDetailsGridProps) {
    return (
        <div className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row h-72">
            {/* Left: Address Info */}
            <div className="p-8 md:w-2/5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2 text-foreground dark:text-white">
                            <span className="material-symbols-outlined text-primary">place</span>
                            Shipping To
                        </h2>
                    </div>
                    <div className="space-y-1">
                        <p className="font-extrabold text-xl text-slate-900 dark:text-white">{address.name}</p>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{address.addressLine1}</p>
                        {address.addressLine2 && (
                            <p className="text-slate-600 dark:text-slate-400 font-medium">{address.addressLine2}</p>
                        )}
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{address.country}</p>
                    </div>
                    <p className="mt-4 text-sm font-bold flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-lg">phone</span>
                        {address.phoneNumber}
                    </p>
                </div>
                <button className="w-fit text-sm font-bold text-primary px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 transition-colors">
                    Update Address
                </button>
            </div>

            {/* Right: Map */}
            <div className="flex-1 relative bg-slate-200 dark:bg-slate-700 min-h-[200px]">
                <div className="absolute inset-0 bg-[#e8e4de] dark:bg-[#2a2520]" />
                {/* Grid lines for map feel */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "linear-gradient(#8a7960 1px, transparent 1px), linear-gradient(90deg, #8a7960 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                {/* Roads */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-2 bg-white/40 dark:bg-white/20 absolute top-1/3" />
                    <div className="w-2 h-full bg-white/40 dark:bg-white/20 absolute left-1/3" />
                    <div className="w-4/5 h-1 bg-white/30 dark:bg-white/10 absolute top-2/3 rotate-[-8deg]" />
                </div>
                {/* Pin */}
                <div className="absolute inset-0 flex items-center justify-center -mt-8">
                    <span className="material-symbols-outlined text-primary text-5xl drop-shadow-lg">location_on</span>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/5" />
                {/* Track button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-primary">map</span>
                        Track Real-time Location
                    </button>
                </div>
            </div>
        </div>
    );
}
