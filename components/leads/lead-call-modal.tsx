"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CallOutcome } from "@/types/lead";
import { PhoneCall, Calendar, Clock } from "lucide-react";

export interface LeadCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    outcome: CallOutcome;
    notes?: string;
    callDate?: string;
    nextFollowUpAt?: string;
    nextMeetingAt?: string;
  }) => Promise<void>;
  leadName?: string;
  isLoading?: boolean;
}

export function LeadCallModal({
  isOpen,
  onClose,
  onSubmit,
  leadName = "Lead",
  isLoading = false,
}: LeadCallModalProps) {
  const [outcome, setOutcome] = React.useState<CallOutcome>(CallOutcome.CONNECTED);
  const [notes, setNotes] = React.useState("");
  const [callDate, setCallDate] = React.useState("");
  const [callTime, setCallTime] = React.useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = React.useState("");
  const [nextMeetingDate, setNextMeetingDate] = React.useState("");
  const [nextMeetingTime, setNextMeetingTime] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setOutcome(CallOutcome.CONNECTED);
      setNotes("");
      setCallDate(now.toISOString().split("T")[0]);
      setCallTime(now.toTimeString().slice(0, 5));
      setNextFollowUpDate("");
      setNextFollowUpTime("10:00");
      setNextMeetingDate("");
      setNextMeetingTime("14:00");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let formattedCallDate: string | undefined = undefined;
    if (callDate) {
      const timeStr = callTime || "12:00";
      formattedCallDate = new Date(`${callDate}T${timeStr}:00`).toISOString();
    }

    let formattedNextFollowUp: string | undefined = undefined;
    if (nextFollowUpDate) {
      const timeStr = nextFollowUpTime || "10:00";
      formattedNextFollowUp = new Date(`${nextFollowUpDate}T${timeStr}:00`).toISOString();
    }

    let formattedNextMeeting: string | undefined = undefined;
    if (nextMeetingDate) {
      const timeStr = nextMeetingTime || "14:00";
      formattedNextMeeting = new Date(`${nextMeetingDate}T${timeStr}:00`).toISOString();
    }

    await onSubmit({
      outcome,
      notes: notes || undefined,
      callDate: formattedCallDate,
      nextFollowUpAt: formattedNextFollowUp,
      nextMeetingAt: formattedNextMeeting,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Call: ${leadName}`}
      description="Record call outcome, conversation notes, and schedule next follow-up or meeting."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        {/* Date & Time of Call */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Call Date *"
            type="date"
            value={callDate}
            onChange={(e) => setCallDate(e.target.value)}
            required
          />
          <Input
            label="Call Time *"
            type="time"
            value={callTime}
            onChange={(e) => setCallTime(e.target.value)}
            required
          />
        </div>

        {/* Outcome Selector */}
        <Select
          label="Call Outcome *"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as CallOutcome)}
          options={[
            { label: "✅ Connected", value: CallOutcome.CONNECTED },
            { label: "🤝 Meeting Fixed", value: CallOutcome.MEETING_FIXED },
            { label: "💡 Interested", value: CallOutcome.INTERESTED },
            { label: "📞 Call Back Requested", value: CallOutcome.CALL_BACK },
            { label: "📵 Not Connected / No Answer", value: CallOutcome.NOT_CONNECTED },
            { label: "⏳ Line Busy", value: CallOutcome.BUSY },
            { label: "❌ Not Interested", value: CallOutcome.NOT_INTERESTED },
            { label: "🚫 Wrong Number", value: CallOutcome.WRONG_NUMBER },
            { label: "📋 Other", value: CallOutcome.OTHER },
          ]}
        />

        {/* Call Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Call Summary & Discussion Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Key points discussed, client pain points, objection details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Next Follow-up Schedule (Optional) */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>Schedule Next Follow-up (Optional)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Follow-up Date"
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
            <Input
              label="Follow-up Time"
              type="time"
              value={nextFollowUpTime}
              onChange={(e) => setNextFollowUpTime(e.target.value)}
            />
          </div>
        </div>

        {/* Next Meeting Schedule (Conditional if Meeting Fixed or selected) */}
        {(outcome === CallOutcome.MEETING_FIXED || nextMeetingDate) && (
          <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-100 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Schedule Fixed Meeting</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Meeting Date"
                type="date"
                value={nextMeetingDate}
                onChange={(e) => setNextMeetingDate(e.target.value)}
              />
              <Input
                label="Meeting Time"
                type="time"
                value={nextMeetingTime}
                onChange={(e) => setNextMeetingTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            <PhoneCall className="h-4 w-4 mr-1.5" />
            {isLoading ? "Logging..." : "Log Call Record"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
