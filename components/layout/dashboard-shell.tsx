"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Drawer } from "@/components/ui/drawer";
import { AuthUser } from "@/types";

export interface DashboardShellProps {
  user: AuthUser | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop & Tablet Sidebar */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen lg:block">
        <Sidebar
          userRole={user?.role}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        side="left"
        className="p-0 border-r border-[#1e3452] bg-[#122238] w-64 max-w-[256px]"
      >
        <Sidebar
          userRole={user?.role}
          onNavigate={() => setIsMobileOpen(false)}
        />
      </Drawer>

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <Header
          title="Evolix OS"
          user={user}
          unreadNotificationsCount={2}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
