import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
