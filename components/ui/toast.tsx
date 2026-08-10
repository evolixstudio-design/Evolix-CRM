"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  type = "info",
  title,
  message,
  onClose,
  className,
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600" />,
    info: <Info className="h-5 w-5 text-sky-600" />,
  };

  const bgStyles = {
    success: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    error: "border-rose-100 bg-rose-50/80 text-rose-900",
    info: "border-sky-100 bg-sky-50/80 text-sky-900",
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-start space-x-3 rounded-xl border p-4 shadow-lg transition-all",
        bgStyles[type],
        className
      )}
    >
      <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        {message && <p className="mt-0.5 text-xs opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
