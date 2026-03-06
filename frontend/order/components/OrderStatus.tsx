"use client";

type TrackingEvent = {
    status: string;
    timestamp: string;
    description: string;
};

type OrderStatusProps = {
    status: string;
    datePlaced: string;
    shipmentId?: string;
    trackingHistory?: TrackingEvent[];
};

const ICON_MAP: Record<string, string> = {
    PLACED: "check",
    PROCESSING: "check",
    CONFIRMED: "check",
    SHIPPED: "local_shipping",
    DELIVERED: "inventory",
    CANCELLED: "cancel",
};

function formatTrackingTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        ", " +
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const STEP_LABELS: Record<string, string> = {
    PLACED: "Order Placed",
    PROCESSING: "Processing",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const STEP_SUBTITLES: Record<string, string> = {
    PLACED: "Verified",
    PROCESSING: "Hand-packed",
    CONFIRMED: "Ready to dispatch",
    SHIPPED: "Courier: FastBake",
    DELIVERED: "Successfully delivered",
    CANCELLED: "Order cancelled",
};

export function OrderStatus({ status, datePlaced, shipmentId, trackingHistory }: OrderStatusProps) {
    const statusUpper = status?.toUpperCase() ?? "PENDING";

    // Derive default history from status if none provided
    const history: TrackingEvent[] = trackingHistory && trackingHistory.length > 0
        ? trackingHistory
        : buildDefault(statusUpper, datePlaced);

    const lastIdx = history.length - 1;

    return (
        <div className="bg-white dark:bg-card-dark p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-foreground dark:text-white">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Tracking History
            </h2>
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {history.map((event, idx) => {
                    const isActive = idx === lastIdx;
                    const icon = ICON_MAP[event.status.toUpperCase()] ?? "radio_button_checked";
                    return (
                        <div key={idx} className="relative pl-8">
                            <div
                                className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 ${isActive
                                        ? "bg-primary " + (statusUpper !== "CANCELLED" ? "animate-pulse" : "")
                                        : "bg-primary"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground dark:text-white"}`}>
                                    {STEP_LABELS[event.status.toUpperCase()] ?? event.status}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatTrackingTime(event.timestamp)} • {event.description || STEP_SUBTITLES[event.status.toUpperCase()]}
                                </p>
                                {isActive && shipmentId && event.status.toUpperCase() === "SHIPPED" && (
                                    <span className="text-[10px] font-mono mt-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-primary rounded border border-amber-100 dark:border-amber-800 inline-block">
                                        {shipmentId}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function buildDefault(status: string, datePlaced: string): TrackingEvent[] {
    const base = new Date(datePlaced).getTime();
    const events: TrackingEvent[] = [
        { status: "PLACED", timestamp: new Date(base).toISOString(), description: "Verified" },
    ];
    const order = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const cancelStatuses = ["CANCELLED", "CANCELED"];

    if (cancelStatuses.includes(status)) {
        events.push({ status: "CANCELLED", timestamp: new Date(base + 2 * 3600000).toISOString(), description: "Order cancelled" });
        return events;
    }
    const idx = order.indexOf(status);
    if (idx >= 1) events.push({ status: "PROCESSING", timestamp: new Date(base + 4 * 3600000).toISOString(), description: "Hand-packed" });
    if (idx >= 3) events.push({ status: "SHIPPED", timestamp: new Date(base + 24 * 3600000).toISOString(), description: "Courier: FastBake" });
    if (idx >= 4) events.push({ status: "DELIVERED", timestamp: new Date(base + 48 * 3600000).toISOString(), description: "Successfully delivered" });
    return events;
}
