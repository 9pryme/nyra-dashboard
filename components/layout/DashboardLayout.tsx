"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {/* Sidebar for desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-xs">
            <Sidebar isMobile onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-64">
        <TopBar 
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}