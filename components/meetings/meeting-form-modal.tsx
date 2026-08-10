"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MeetingType } from "@/types/meeting";
import { Calendar, Video, MapPin, Users, Link as LinkIcon, Bell } from "lucide-react";

export interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    leadId?: string | null;
    clientId?: string | null;
    meetingDate: string;
    startTime: string;
    endTime: string;
    type?: MeetingType;
    meetingLink?: string | null;
    location?: string | null;
    participants?: string | null;
    notes?: string | null;
    createInternalReminder?: boolean;
    createClientReminder?: boolean;
  }) => Promise<void>;
  leads?: { id: string; name: string }[];
  clients?: { id: string; name: string }[];
  presetLeadId?: string | null;
  presetClientId?: string | null;
  presetTitle?: string;
  isLoading?: boolean;
}

export function MeetingFormModal({
  isOpen,
  onClose,
  onSubmit,
  leads = [],
  clients = [],
  presetLeadId = null,
  presetClientId = null,
  presetTitle = "",
  isLoading = false,
}: MeetingFormModalProps) {
  const [title, setTitle] = React.useState("");
  const [targetType, setTargetType] = React.useState<"lead" | "client" | "none">("lead");
  const [selectedLeadId, setSelectedLeadId] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState("");
  const [meetingDate, setMeetingDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("11:00");
  const [type, setType] = React.useState<MeetingType>(MeetingType.GOOGLE_MEET);
  const [meetingLink, setMeetingLink] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [participants, setParticipants] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [createInternalReminder, setCreateInternalReminder] = React.useState(true);
  const [createClientReminder, setCreateClientReminder] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().split("T")[0];
      setTitle(presetTitle || "");
      setMeetingDate(todayStr);
      setStartTime("10:00");
      setEndTime("11:00");
      setType(MeetingType.GOOGLE_MEET);
      setMeetingLink("");
      setLocation("");
      setParticipants("");
      setNotes("");
      setCreateInternalReminder(true);
      setCreateClientReminder(true);

      if (presetLeadId) {
        setTargetType("lead");
        setSelectedLeadId(presetLeadId);
        setSelectedClientId("");
      } else if (presetClientId) {
        setTargetType("client");
        setSelectedClientId(presetClientId);
        setSelectedLeadId("");
      } else {
        setTargetType("lead");
        setSelectedLeadId("");
        setSelectedClientId("");
      }
    }
  }, [isOpen, presetLeadId, presetClientId, presetTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meetingDate || !startTime || !endTime) return;

    const fullMeetingDate = new Date(`${meetingDate}T${startTime}:00`).toISOString();

    await onSubmit({
      title: title.trim(),
      leadId: targetType === "lead" ? selectedLeadId || null : null,
      clientId: targetType === "client" ? selectedClientId || null : null,
      meetingDate: fullMeetingDate,
      startTime,
      endTime,
      type,
      meetingLink: meetingLink.trim() || null,
      location: location.trim() || null,
      participants: participants.trim() || null,
      notes: notes.trim() || null,
      createInternalReminder,
      createClientReminder,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Meeting"
      description="Set meeting details, location or video link, participants, and reminder preferences."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Meeting Title *"
          placeholder="e.g. Initial Discovery Call / Project Scope Alignment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Association Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Link to Lead or Client</label>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "lead"}
                onChange={() => setTargetType("lead")}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>Lead</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "client"}
                onChange={() => setTargetType("client")}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>Client</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                checked={targetType === "none"}
                onChange={() => setTargetType("none")}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>Standalone / General</span>
            </label>
          </div>

          {targetType === "lead" && leads.length > 0 && (
            <Select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              placeholder="Select Lead..."
              options={leads.map((l) => ({ label: l.name, value: l.id }))}
            />
          )}

          {targetType === "client" && clients.length > 0 && (
            <Select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              placeholder="Select Client..."
              options={clients.map((c) => ({ label: c.name, value: c.id }))}
            />
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Date *"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
          />
          <Input
            label="Start Time *"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End Time *"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* Meeting Type & Links */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Meeting Type *"
            value={type}
            onChange={(e) => setType(e.target.value as MeetingType)}
            options={[
              { label: "📹 Google Meet", value: MeetingType.GOOGLE_MEET },
              { label: "🎥 Zoom Video", value: MeetingType.ZOOM },
              { label: "🌐 Online Meeting", value: MeetingType.ONLINE },
              { label: "📍 Offline / In-Person", value: MeetingType.OFFLINE },
              { label: "📞 Phone Call", value: MeetingType.PHONE },
              { label: "📋 Other", value: MeetingType.OTHER },
            ]}
          />

          <Input
            label="Meeting Link (URL)"
            placeholder="https://meet.google.com/abc-defg-hij"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
        </div>

        {type === MeetingType.OFFLINE && (
          <Input
            label="Physical Location / Address"
            placeholder="e.g. Evolix HQ Conference Room B"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        )}

        <Input
          label="Participants / Attendee Emails"
          placeholder="e.g. founder@evolix.io, client@company.com"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Agenda & Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Key discussion topics, proposal review points..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Reminders Architecture Options */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Bell className="h-4 w-4 text-indigo-600" />
            <span>Reminder Preferences</span>
          </div>

          <div className="space-y-1 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createInternalReminder}
                onChange={(e) => setCreateInternalReminder(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Create internal dashboard notification (30 mins before)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createClientReminder}
                onChange={(e) => setCreateClientReminder(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Generate client email/WhatsApp reminder architecture record</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            <Calendar className="h-4 w-4 mr-1.5" />
            {isLoading ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
