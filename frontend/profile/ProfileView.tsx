"use client";

import {
  TopNavBar,
  ProfileSidebar,
  ProfilePageHeading,
  ProfileHeaderCard,
  RecentOrdersCard,
  SavedAddressesCard,
  ActiveSubscriptionsCard,
  EditProfileModal,
  AddAddressModal,
  ActionErrorToast,
  OrdersTabContent,
  WishlistTabContent,
  AddressesTabContent,
  SubscriptionsTabContent,
  SettingsTabContent,
} from "./components";

import { useProfileViewModel } from "./viewModel/useProfileViewModel";
import { useAuth } from "@/hooks/useAuth";

export function ProfileView() {
  const { userId, loading: authLoading } = useAuth();

  /* ── Auth loading ── */
  if (authLoading) {
    return (
      <>
        <TopNavBar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 lg:px-10 py-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              <p className="text-[#8a7960]">Checking authentication…</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── Not logged in ── */
  if (!userId) {
    return (
      <>
        <TopNavBar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 lg:px-10 py-8">
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <span className="material-symbols-outlined text-5xl text-stone-300">lock</span>
            <div className="text-center">
              <p className="text-[#181511] dark:text-white text-xl font-bold">Please log in to view your profile</p>
              <p className="text-[#8a7960] dark:text-stone-400 text-sm mt-2">You need to be authenticated to access this page.</p>
            </div>
            <a
              href="/login"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all"
            >
              Go to Login
            </a>
          </div>
        </main>
      </>
    );
  }

  return <AuthenticatedProfile key={userId} userId={userId} />;
}

/** Inner component – only rendered when userId is available. */
function AuthenticatedProfile({ userId }: { userId: string }) {
  const {
    dashboard,
    loading,
    error,
    activeTab,
    setActiveTab,
    actionError,
    handleRetry,
    isEditProfileOpen,
    handleEditProfile,
    handleCloseEditProfile,
    handleSaveProfile,
    isAddAddressOpen,
    handleOpenAddAddress,
    handleCloseAddAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleManageSubscription,
    handleRemoveFromWishlist,
    handleAddToCartFromWishlist,
    isSaving,
    handleNewOrder,
    handleViewAllOrders,
    handleManageAddresses,
    handleLogout,
  } = useProfileViewModel({ userId });

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <TopNavBar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 lg:px-10 py-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              <p className="text-[#8a7960]">Loading your profile…</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── Error state (backend error with retry) ── */
  if (error) {
    return (
      <>
        <TopNavBar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 lg:px-10 py-8">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
            <p className="text-red-500 font-medium text-center max-w-md">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">refresh</span>
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!dashboard) return null;

  const { user, recentOrders, savedAddresses, subscriptions, wishlist } = dashboard;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <>
            <ProfilePageHeading userName={user.name} onNewOrder={handleNewOrder} />
            <ProfileHeaderCard user={user} onEditProfile={handleEditProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecentOrdersCard orders={recentOrders} onViewAll={handleViewAllOrders} />
              <SavedAddressesCard addresses={savedAddresses} onManage={handleManageAddresses} onAddAddress={handleOpenAddAddress} />
              <ActiveSubscriptionsCard subscriptions={subscriptions} onManageSubscription={handleManageSubscription} />
            </div>
          </>
        );
      case "orders":
        return <OrdersTabContent orders={recentOrders} />;
      case "wishlist":
        return <WishlistTabContent items={wishlist} onRemove={handleRemoveFromWishlist} onAddToCart={handleAddToCartFromWishlist} />;
      case "addresses":
        return <AddressesTabContent addresses={savedAddresses} onAddAddress={handleOpenAddAddress} onDeleteAddress={handleDeleteAddress} />;
      case "subscriptions":
        return <SubscriptionsTabContent subscriptions={subscriptions} onManageSubscription={handleManageSubscription} />;
      case "settings":
        return <SettingsTabContent userEmail={user.email} />;
      default:
        return null;
    }
  };

  return (
    <>
      <TopNavBar avatarUrl={user.navbarAvatarUrl ?? user.avatarUrl} />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProfileSidebar
            userName={user.name}
            membershipTier={user.membershipTier}
            avatarUrl={user.sidebarAvatarUrl ?? user.avatarUrl}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col gap-6">{renderTabContent()}</div>
        </div>
      </main>

      {/* Modals – conditionally rendered so they remount with fresh state */}
      {isEditProfileOpen && (
        <EditProfileModal
          user={user}
          isSaving={isSaving}
          apiError={actionError}
          onClose={handleCloseEditProfile}
          onSave={handleSaveProfile}
        />
      )}
      {isAddAddressOpen && (
        <AddAddressModal
          isSaving={isSaving}
          apiError={actionError}
          onClose={handleCloseAddAddress}
          onSave={handleSaveAddress}
        />
      )}

      {/* Toast for action errors (delete address, etc.) */}
      <ActionErrorToast
        message={!isEditProfileOpen && !isAddAddressOpen ? actionError : null}
        onDismiss={() => {}}
      />
    </>
  );
}