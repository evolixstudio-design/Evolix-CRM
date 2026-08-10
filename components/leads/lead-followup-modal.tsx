"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FollowUpType } from "@/types/lead";
import { Calendar, Clock } from "lucide-react";

export interface LeadFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: FollowUpType;
    dueDate: string;
    notes?: string;
    assignedToId?: string;
  }) => Promise<void>;
  leadName?: string;
  coFounders?: { id: string; name: string }[];
  isLoading?: boolean;
}

export function LeadFollowUpModal({
  isOpen,
  onClose,
  onSubmit,
  leadName = "Lead",
  coFounders = [],
  isLoading = false,
}: LeadFollowUpModalProps) {
  const [type, setType] = React.useState<FollowUpType>(FollowUpType.CALL);
  const [dueDate, setDueDate] = React.useState("");
  const [dueTime, setDueTime] = React.useState("10:00");
  const [notes, setNotes] = React.useState("");
  const [assignedToId, setAssignedToId] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setType(FollowUpType.CALL);
      setDueDate(tomorrow.toISOString().split("T")[0]);
      setDueTime("10:00");
      setNotes("");
      setAssignedToId("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;

    const timeStr = dueTime || "10:00";
    const fullDueDate = new Date(`${dueDate}T${timeStr}:00`).toISOString();

    await onSubmit({
      type,
      dueDate: fullDueDate,
      notes: notes || undefined,
      assignedToId: assignedToId || undefined,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Follow-up: ${leadName}`}
      description="Set follow-up date, time, interaction type, and assign responsible co-founder."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Select
          label="Follow-up Type *"
          value={type}
          onChange={(e) => setType(e.target.value as FollowUpType)}
          options={[
            { label: "📞 Phone Call", value: FollowUpType.CALL },
            { label: "💬 WhatsApp Message", value: FollowUpType.WHATSAPP },
            { label: "✉️ Email Follow-up", value: FollowUpType.EMAIL },
            { label: "🤝 Meeting", value: FollowUpType.MEETING },
            { label: "📋 Other Action", value: FollowUpType.OTHER },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due Date *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Input
            label="Due Time *"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            required
          />
        </div>

        {coFounders.length > 0 && (
          <Select
            label="Assign Responsible Co-Founder"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            placeholder="Default to lead assignee"
            options={coFounders.map((f) => ({ label: f.name, value: f.id }))}
          />
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Follow-up Task Notes / Goal</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="What needs to be discussed or sent (e.g. Send updated pricing proposal, confirm call time)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            <Calendar className="h-4 w-4 mr-1.5" />
            {isLoading ? "Scheduling..." : "Schedule Follow-up"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
