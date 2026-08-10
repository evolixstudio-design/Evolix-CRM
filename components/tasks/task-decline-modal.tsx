"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface TaskDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (reason: string) => Promise<void>;
  taskTitle?: string;
  isLoading?: boolean;
}

export function TaskDeclineModal({
  isOpen,
  onClose,
  onConfirmDecline,
  taskTitle = "Task",
  isLoading = false,
}: TaskDeclineModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) return;
    await onConfirmDecline(reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 text-rose-600 border-b border-slate-100 pb-3">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-base font-bold text-slate-900">Decline Task Assignment</h3>
        </div>

        <p className="text-xs text-slate-600">
          Decline task <strong className="text-slate-900">&ldquo;{taskTitle}&rdquo;</strong>. A reason is required so the creator understands why this assignment was declined.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Decline Reason *</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="e.g. Current workload capacity full / Scope outside expertise domain..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            type="submit"
            disabled={isLoading || reason.trim().length < 3}
          >
            {isLoading ? "Declining..." : "Decline Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
