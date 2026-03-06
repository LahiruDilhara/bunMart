import { Sidebar } from "@/shipping/components/layout/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#212529]">
        {/* Main Wrapper */}
        <div className="flex min-h-screen">
          
          {/* 1. THE SIDEBAR */}
          <Sidebar />

          {/* 2. CONTENT AREA */}
          {/* The Topbar component has been removed below */}
          <div className="flex flex-col flex-1 w-full lg:pl-60"> 
            <main className="flex-1 p-6 lg:p-10">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}