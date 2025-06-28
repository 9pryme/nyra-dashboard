"use client";

import { useState, useEffect } from "react";
import Sidebar, { SidebarProvider, useSidebar } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-52 max-w-xs h-full">
            <Sidebar className="relative" />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "lg:ml-0", // Remove margin on large screens since sidebar is positioned fixed
        isCollapsed ? "lg:pl-14" : "lg:pl-52" // Add padding based on sidebar state
      )}>
        <TopBar 
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
          className="sticky top-0 z-30"
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-w-0">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}