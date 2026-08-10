import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load requested data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center",
        className
      )}
    >
      <div className="rounded-full bg-rose-100 p-3 text-rose-600 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      {message && (
        <p className="mt-1 text-xs text-rose-600 max-w-sm">{message}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-rose-200 text-rose-700 hover:bg-rose-100">
          Try Again
        </Button>
      )}
    </div>
  );
}
