import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ProfileSidebar } from "./ProfileSidebar";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import { getStoredUserId } from "@/service/api";

export function ProfileLayout() {
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const userId = getStoredUserId();
  const isGuest = !userId || userId === "guest";

  useEffect(() => {
    if (!isLoggedIn || isGuest) {
      navigate("/auth/signin", { replace: true });
    }
  }, [isLoggedIn, isGuest, navigate]);

  if (!isLoggedIn || isGuest) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      <ProfileSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
