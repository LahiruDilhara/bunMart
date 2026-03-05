import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/shipping/components/layout/Sidebar";
import { Topbar } from "@/shipping/components/layout/Topbar";

export const metadata: Metadata = {
  title: "BunMart Shipping",
  description: "Shipping management dashboard for BunMart",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-bg">
          <Sidebar />
          <div className="flex flex-col flex-1 ml-0 lg:ml-60">
            <Topbar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
