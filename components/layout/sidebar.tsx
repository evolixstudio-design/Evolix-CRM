"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Users,
  Handshake,
  FolderKanban,
  UserCheck,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("CO_FOUNDER" | "INTERN")[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: UserCheck },
  { name: "Workboard", href: "/workboard", icon: CheckSquare, roles: ["CO_FOUNDER"] },
  { name: "Leads", href: "/leads", icon: Target, roles: ["CO_FOUNDER"] },
  { name: "Quotations", href: "/quotations", icon: CreditCard, roles: ["CO_FOUNDER"] },
  { name: "Invoices", href: "/invoices", icon: CreditCard, roles: ["CO_FOUNDER"] },
  { name: "Recurring Deals", href: "/recurring", icon: CreditCard, roles: ["CO_FOUNDER"] },
  { name: "Clients & Onboarding", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Team / Interns", href: "/team", icon: UserCheck, roles: ["CO_FOUNDER"] },
  { name: "Finance", href: "/finance", icon: CreditCard, roles: ["CO_FOUNDER"] },
  { name: "Audit Trail", href: "/activity", icon: BarChart3, roles: ["CO_FOUNDER"] },
  { name: "Reports & Activity", href: "/reports", icon: BarChart3 },
];

export interface SidebarProps {
  userRole?: "CO_FOUNDER" | "INTERN";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  userRole = "CO_FOUNDER",
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "h-full flex-col justify-between border-r border-[#1e3452] bg-[#122238] text-slate-300 transition-all duration-300 flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div>
        <div
          className={cn(
            "flex h-16 items-center border-b border-[#1e3452] px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <img src="/logo.jpg" alt="EVOLIX OS" className="h-9 w-9 flex-shrink-0 object-contain rounded-xl shadow-sm" />
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-wider text-white">EVOLIX OS</h1>
                <p className="text-[10px] text-slate-400 font-medium truncate">Agency Operating System</p>
              </div>
            )}
          </div>

          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-[#1a2f4c] hover:text-white transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 px-2 py-4">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#1a2f4c] text-white font-semibold border-l-2 border-teal-400"
                    : "text-slate-400 hover:bg-[#1a2f4c]/50 hover:text-slate-200",
                  isCollapsed && "justify-center px-0 space-x-0"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-teal-400" : "text-slate-400")} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Expand Button for Tablet/Desktop */}
      {onToggleCollapse && isCollapsed && (
        <div className="p-2 border-t border-[#1e3452] flex justify-center hidden lg:flex">
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-400 hover:bg-[#1a2f4c] hover:text-white transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
