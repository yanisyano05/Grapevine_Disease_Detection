"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import Sidebar from "@/components/admin/sidebar";
import Header from "@/components/admin/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[260px] border-r border-[oklch(0.20_0.006_60)] bg-[oklch(0.11_0.005_60)]">
          <Sidebar userName={userName} userEmail={userEmail} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} userName={userName} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
