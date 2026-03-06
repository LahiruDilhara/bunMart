"use client";

type OrderHeaderProps = {
    orderId: string;
    datePlaced: string;
    status: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    CONFIRMED: { label: "Confirmed", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
    SHIPPED: { label: "Shipped", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    CANCELED: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function OrderHeader({ orderId, datePlaced, status }: OrderHeaderProps) {
    const formattedDate = new Date(datePlaced).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const statusUpper = status?.toUpperCase() ?? "PENDING";
    const statusCfg = STATUS_CONFIG[statusUpper] ?? { label: status, color: "bg-slate-100 text-slate-700" };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <a className="hover:text-primary transition-colors" href="#">My Orders</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-slate-500">Order #{orderId}</span>
                </nav>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground dark:text-white">
                    Order Details
                </h1>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm hover:shadow-md transition-shadow">
                    <span className="material-symbols-outlined text-lg">share</span>
                    Share
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-lg">reorder</span>
                    Reorder Items
                </button>
            </div>
        </div>
    );
}

type OrderStatusBadgeProps = { status: string };

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const statusUpper = status?.toUpperCase() ?? "PENDING";
    const statusCfg = STATUS_CONFIG[statusUpper] ?? { label: status, color: "bg-slate-100 text-slate-700" };
    return (
        <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusCfg.color}`}>
            Current Status: {statusCfg.label}
        </span>
    );
}
