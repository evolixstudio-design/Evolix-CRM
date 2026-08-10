"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  className,
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm">
      <div
        className={cn(
          "fixed inset-y-0 flex max-w-full bg-white shadow-xl border-slate-200 transition-transform duration-300 ease-in-out",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          "w-screen max-w-md",
          className
        )}
      >
        <div className="flex h-full w-full flex-col p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
