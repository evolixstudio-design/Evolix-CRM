import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-slate-500",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
