import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getProfile } from "@/service/profileService";
import { getOrdersByUser } from "@/service/orderService";
import { createPaymentForOrder } from "@/service/paymentService";
import { logout } from "@/service/authService";
import { getStoredUserId } from "@/service/api";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import type { UserProfile } from "@/model/profile";
import type { Order } from "@/model/order";
import { isUnpaidOrder } from "@/model/order";

export function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placedOrderId = searchParams.get("order");
  const placed = searchParams.get("placed") === "1";

  const isLoggedIn = useIsLoggedIn();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const userId = getStoredUserId();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/signin", { replace: true });
      return;
    }
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProfile(), getOrdersByUser(userId)])
      .then(([profileData, ordersData]) => {
        if (!cancelled) {
          setProfile(profileData);
          setOrders(ordersData);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId, navigate]);

  const handlePayOrder = async (orderId: string) => {
    if (!userId) return;
    setPayingOrderId(orderId);
    setError(null);
    try {
      const { redirectUrl } = await createPaymentForOrder(orderId, userId);
      window.location.href = redirectUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start payment");
      setPayingOrderId(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
    navigate("/", { replace: true });
  };

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <main className="flex-1 px-4 md:px-10 lg:px-40 py-8">
        <div className="flex flex-col items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading profile…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>Profile</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Profile</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          {loggingOut ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">logout</span>
          )}
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {placed && placedOrderId && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
          Order placed successfully. You can pay for it below.
        </div>
      )}

      {profile && (
        <div className="space-y-8">
          <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Account</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Name</dt>
                <dd className="mt-1 font-medium text-foreground dark:text-white">
                  {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Email</dt>
                <dd className="mt-1 text-foreground dark:text-white">{profile.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Phone</dt>
                <dd className="mt-1 text-foreground dark:text-white">{profile.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500 dark:text-stone-400">Role</dt>
                <dd className="mt-1 text-foreground dark:text-white capitalize">{profile.role ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Addresses</h2>
            {profile.addresses && profile.addresses.length > 0 ? (
              <ul className="space-y-4">
                {profile.addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="p-4 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50"
                  >
                    <p className="font-medium text-foreground dark:text-white capitalize">{addr.type}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                      {addr.street}
                      {addr.city && `, ${addr.city}`}
                      {addr.state && `, ${addr.state}`} {addr.postalCode}
                      {addr.country && `, ${addr.country}`}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No addresses saved.</p>
            )}
          </section>

          <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted">No orders yet.</p>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    id={placedOrderId === order.id ? "placed-order" : undefined}
                    className={`p-4 rounded-lg border bg-stone-50/50 dark:bg-stone-900/50 ${
                      placedOrderId === order.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-stone-100 dark:border-stone-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground dark:text-white">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(order.createdAt).toLocaleString()} · {order.status}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Total: {order.currencyCode === "USD" ? "$" : ""}{order.total} {order.currencyCode ?? "USD"}
                        </p>
                      </div>
                      {isUnpaidOrder(order.status) && (
                        <button
                          type="button"
                          onClick={() => handlePayOrder(order.id)}
                          disabled={!userId || payingOrderId === order.id}
                          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
                        >
                          {payingOrderId === order.id ? "Redirecting…" : "Pay now"}
                        </button>
                      )}
                    </div>
                    {order.shippingAddress && (
                      <p className="text-xs text-muted mt-2 truncate" title={order.shippingAddress}>
                        {order.shippingAddress}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
