import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppNav, AppFooter } from "@/components/layout";
import { AdminLayout } from "@/components/admin";
import { KitchenLayout } from "@/components/kitchen";
import { DriverLayout } from "@/components/driver";
import { HomePage } from "@/pages/HomePage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { PaymentSuccessPage } from "@/pages/PaymentSuccessPage";
import { PaymentFailedPage } from "@/pages/PaymentFailedPage";
import { ProfileLayout } from "@/components/profile";
import { ProfileDashboardPage } from "@/pages/profile/ProfileDashboardPage";
import { ProfileOrdersPage } from "@/pages/profile/ProfileOrdersPage";
import { ProfileAddressesPage } from "@/pages/profile/ProfileAddressesPage";
import { ProfileAccountPage } from "@/pages/profile/ProfileAccountPage";
import { ProfileNotificationsPage } from "@/pages/profile/ProfileNotificationsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminPricingPage } from "@/pages/admin/AdminPricingPage";
import { KitchenPage } from "@/pages/kitchen/KitchenPage";
import { DriverPage } from "@/pages/driver/DriverPage";
import { AdminShippingPage } from "@/pages/admin/AdminShippingPage";
import { AdminDriversPage } from "@/pages/admin/AdminDriversPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-container flex min-h-screen flex-col grow">
      <AppNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <AppFooter />
    </div>
  );
}

export default function App() {
  const basename = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/cart"
          element={
            <Layout>
              <CartPage />
            </Layout>
          }
        />
        <Route
          path="/checkout"
          element={
            <Layout>
              <CheckoutPage />
            </Layout>
          }
        />
        <Route
          path="/payment/success"
          element={
            <Layout>
              <PaymentSuccessPage />
            </Layout>
          }
        />
        <Route
          path="/payment/failed"
          element={
            <Layout>
              <PaymentFailedPage />
            </Layout>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <Layout>
              <PaymentFailedPage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfileLayout />
            </Layout>
          }
        >
          <Route index element={<ProfileDashboardPage />} />
          <Route path="notifications" element={<ProfileNotificationsPage />} />
          <Route path="orders" element={<ProfileOrdersPage />} />
          <Route path="addresses" element={<ProfileAddressesPage />} />
          <Route path="account" element={<ProfileAccountPage />} />
        </Route>
        <Route path="/admin" element={<Layout><AdminLayout /></Layout>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="shipping" element={<AdminShippingPage />} />
          <Route path="drivers" element={<AdminDriversPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
        </Route>
        <Route path="/kitchen" element={<Layout><KitchenLayout /></Layout>}>
          <Route index element={<KitchenPage />} />
        </Route>
        <Route path="/driver" element={<Layout><DriverLayout /></Layout>}>
          <Route index element={<DriverPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
