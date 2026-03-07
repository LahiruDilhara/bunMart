import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { getStoredUserId } from "@/service/api";
import { sendInAppNotification } from "@/service/notificationService";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") ?? searchParams.get("orderId");
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("paymentId");
  const sessionId = searchParams.get("session_id");
  const notifiedRef = useRef(false);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId || userId === "guest" || !orderId || notifiedRef.current) return;
    notifiedRef.current = true;
    const key = `payment_notified_${orderId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sendInAppNotification({
      userId,
      subject: "Payment successful",
      body: `Your payment for order #${orderId.slice(0, 8)} was successful. Your order will be processed shortly.`,
      referenceType: "PAYMENT",
      referenceId: orderId,
    }).catch(() => {});
  }, [orderId]);

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-12 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
          Payment successful
        </h1>
        <p className="text-muted mb-6">
          Your payment was completed successfully. Your order will be processed shortly.
          {orderId && (
            <span className="block mt-2 font-mono text-sm">
              Order #{orderId.slice(0, 8)}
              {paymentId && ` · Payment ${paymentId.slice(0, 8)}`}
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/profile/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            View my orders
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
