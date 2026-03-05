"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProfileDashboard, SavedAddress } from "@/models/profile";
import {
  getProfileDashboard,
  updateUser,
  createAddress,
  deleteAddress,
  ProfileApiError,
} from "@/service/profileService";

/** Active sidebar tab. */
export type ProfileTab =
  | "profile"
  | "orders"
  | "wishlist"
  | "addresses"
  | "subscriptions"
  | "settings";

interface UseProfileViewModelOptions {
  userId: string;
}

export function useProfileViewModel({ userId }: UseProfileViewModelOptions) {
  const [dashboard, setDashboard] = useState<ProfileDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  /* ── modal state ── */
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  /** Errors from save/delete actions shown in modals or toasts */
  const [actionError, setActionError] = useState<string | null>(null);

  /** Clear action error after 5 seconds */
  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 5000);
    return () => clearTimeout(t);
  }, [actionError]);

  /* ── fetch dashboard on mount / userId change ── */
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    getProfileDashboard(userId)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ProfileApiError
              ? err.message
              : "Failed to load profile"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ── retry ── */
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    getProfileDashboard(userId)
      .then(setDashboard)
      .catch((err) =>
        setError(
          err instanceof ProfileApiError
            ? err.message
            : "Failed to load profile"
        )
      )
      .finally(() => setLoading(false));
  }, [userId]);

  /* ── edit profile ── */
  const handleEditProfile = useCallback(() => {
    setActionError(null);
    setIsEditProfileOpen(true);
  }, []);

  const handleCloseEditProfile = useCallback(() => {
    setIsEditProfileOpen(false);
    setActionError(null);
  }, []);

  const handleSaveProfile = useCallback(
    async (data: { name: string; email: string; phone: string }) => {
      if (!dashboard) return;
      setIsSaving(true);
      setActionError(null);
      try {
        const updatedUser = await updateUser(userId, data);
        setDashboard((prev) =>
          prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : prev
        );
        setIsEditProfileOpen(false);
      } catch (err) {
        setActionError(
          err instanceof ProfileApiError
            ? err.message
            : "Failed to update profile"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [dashboard, userId]
  );

  /* ── new order ── */
  const handleNewOrder = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  /* ── orders ── */
  const handleViewAllOrders = useCallback(() => {
    setActiveTab("orders");
  }, []);

  /* ── addresses ── */
  const handleManageAddresses = useCallback(() => {
    setActiveTab("addresses");
  }, []);

  const handleOpenAddAddress = useCallback(() => {
    setActionError(null);
    setIsAddAddressOpen(true);
  }, []);

  const handleCloseAddAddress = useCallback(() => {
    setIsAddAddressOpen(false);
    setActionError(null);
  }, []);

  const handleSaveAddress = useCallback(
    async (data: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
      type: string;
    }) => {
      setIsSaving(true);
      setActionError(null);
      try {
        const newAddr = await createAddress(userId, data);
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            savedAddresses: [...prev.savedAddresses, newAddr],
          };
        });
        setIsAddAddressOpen(false);
      } catch (err) {
        setActionError(
          err instanceof ProfileApiError
            ? err.message
            : "Failed to add address"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const handleDeleteAddress = useCallback(
    async (addressId: string) => {
      setActionError(null);
      try {
        await deleteAddress(userId, addressId);
        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                savedAddresses: prev.savedAddresses.filter(
                  (a) => a.id !== addressId
                ),
              }
            : prev
        );
      } catch (err) {
        setActionError(
          err instanceof ProfileApiError
            ? err.message
            : "Failed to delete address"
        );
      }
    },
    [userId]
  );

  /* ── subscriptions ── */
  const handleManageSubscription = useCallback((_subscriptionId: string) => {
    setActiveTab("subscriptions");
  }, []);

  /* ── wishlist (stubs until service ready) ── */
  const handleRemoveFromWishlist = useCallback(async (_itemId: string) => {
    // TODO: call wishlist service
  }, []);

  const handleAddToCartFromWishlist = useCallback(
    async (_productId: string) => {
      // TODO: call cart service
    },
    []
  );

  /* ── logout ── */
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bunmart_user_id");
      window.location.href = "/";
    }
  }, []);

  return {
    dashboard,
    loading,
    error,
    activeTab,
    setActiveTab,
    actionError,

    handleRetry,

    // edit profile
    isEditProfileOpen,
    handleEditProfile,
    handleCloseEditProfile,
    handleSaveProfile,

    // add address
    isAddAddressOpen,
    handleOpenAddAddress,
    handleCloseAddAddress,
    handleSaveAddress,
    handleDeleteAddress,

    // subscriptions
    handleManageSubscription,

    // wishlist
    handleRemoveFromWishlist,
    handleAddToCartFromWishlist,

    // misc
    isSaving,
    handleNewOrder,
    handleViewAllOrders,
    handleManageAddresses,
    handleLogout,
  };
}