"use client";

type OrderSummaryProps = {
    summary: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
};

export function OrderSummary({ summary }: OrderSummaryProps) {
    return (
        <div className="bg-white dark:bg-background-dark border border-border rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6 text-foreground dark:text-white">
                Summary
            </h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span className="text-foreground dark:text-white font-medium">${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                    <span>Shipping (Express)</span>
                    <span className="text-foreground dark:text-white font-medium">${summary.shipping.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-t border-border pt-6 mb-6 text-sm">
                <h4 className="text-muted font-bold text-xs uppercase tracking-wider mb-4">
                    Tax Breakdown
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-muted">
                        <span>State Tax (4.5%)</span>
                        <span className="text-foreground dark:text-white font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-muted">
                        <span>City Tax (1.2%)</span>
                        <span className="text-foreground dark:text-white font-medium">$0.00</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-between items-center">
                <span className="text-xl font-black text-foreground dark:text-white">Total</span>
                <span className="text-3xl font-black text-orange-500">${summary.total.toFixed(2)}</span>
            </div>
        </div>
    );
}
