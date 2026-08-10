"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl transition-all border border-slate-100",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
