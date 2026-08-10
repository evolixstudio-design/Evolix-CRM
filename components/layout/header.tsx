"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Check,
  FolderCheck,
  IndianRupee,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthUser } from "@/types";

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface HeaderProps {
  title?: string;
  user?: AuthUser | null;
  unreadNotificationsCount?: number;
  onOpenMobileMenu?: () => void;
}

export function Header({
  title = "Evolix OS",
  user,
  unreadNotificationsCount: initialUnreadCount = 0,
  onOpenMobileMenu,
}: HeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifDropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "LEAD_CONVERTED":
      case "SYSTEM":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "PROJECT_COMPLETED":
        return <FolderCheck className="h-4 w-4 text-emerald-500" />;
      case "PAYMENT_RECEIVED":
        return <IndianRupee className="h-4 w-4 text-teal-600" />;
      case "TASK_ASSIGNED":
        return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Search bar */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, projects, clients..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Notifications button & Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) fetchNotifications();
            }}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="info" className="text-[10px] px-1.5 py-0.5">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto space-y-1 pr-1">
                {isLoadingNotifications && notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Updates on leads, tasks, payments, and projects will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`flex items-start space-x-3 rounded-xl p-2.5 transition-colors cursor-pointer ${
                        n.isRead
                          ? "bg-white hover:bg-slate-50 opacity-75"
                          : "bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-100">
                        {renderNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user?.role || "CO_FOUNDER"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl border-slate-200 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || "User Name"}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || "user@evolix.io"}</p>
                <div className="mt-1.5">
                  <Badge variant={user?.role === "CO_FOUNDER" ? "default" : "info"}>
                    {user?.role || "CO_FOUNDER"}
                  </Badge>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
