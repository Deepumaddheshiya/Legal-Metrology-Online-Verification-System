"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GovHeader } from "@/components/shared/GovHeader";
import { NavSidebar } from "@/components/shared/NavSidebar";
import { DashboardRouteGuard } from "@/components/auth/DashboardRouteGuard";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { init, isDemoMode, isAuthenticated, currentUser, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isLoading && !currentUser && !isDemoMode) {
      router.push("/login");
    }
  }, [currentUser, isDemoMode, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <NavSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isDemoMode && !isAuthenticated && (
        <div className="lg:pl-64 bg-amber-500 text-white text-xs font-semibold text-center py-1.5 px-4 no-print">
          DEMO PREVIEW MODE — you are viewing the interface as a sample role without a real
          login. All backend actions remain protected by server-side RBAC. Sign in at /login for
          full access.
        </div>
      )}

      {/* Main Content Area shifted right on desktop */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <GovHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <DashboardRouteGuard>{children}</DashboardRouteGuard>
        </main>
      </div>
    </div>
  );
}
