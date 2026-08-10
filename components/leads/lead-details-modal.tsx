"use client";

import * as React from "react";
import {
  Calendar,
  IndianRupee,
  User,
  Phone,
  Mail,
  Building,
  ArrowRightLeft,
  MessageSquare,
  Plus,
  Send,
  PhoneCall,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LeadItem, LeadActivityItem, LeadFollowUpItem } from "@/types/lead";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LeadStatus, LeadPriority, LeadActivityType } from "@prisma/client";
import { getSourceConfig } from "@/lib/lead-source-utils";
import { NoteAttachments } from "@/components/ui/note-attachments";

export interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: (LeadItem & { activities?: LeadActivityItem[]; followUps?: LeadFollowUpItem[] }) | null;
  coFounders: { id: string; name: string }[];
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void>;
  onAssignChange: (leadId: string, founderId: string | null) => Promise<void>;
  onAddActivity: (leadId: string, type: LeadActivityType, content: string) => Promise<void>;
  onConvertLead: (lead: LeadItem) => void;
  onLogCall?: (lead: LeadItem) => void;
  onAddFollowUp?: (lead: LeadItem) => void;
  onScheduleMeeting?: (lead: LeadItem) => void;
  onToggleFollowUpComplete?: (followUpId: string, isCompleted: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function LeadDetailsModal({
  isOpen,
  onClose,
  lead,
  coFounders,
  onStatusChange,
  onAssignChange,
  onAddActivity,
  onConvertLead,
  onLogCall,
  onAddFollowUp,
  onScheduleMeeting,
  onToggleFollowUpComplete,
  isLoading = false,
}: LeadDetailsModalProps) {
  const [activityType, setActivityType] = React.useState<LeadActivityType>(LeadActivityType.NOTE);
  const [activityContent, setActivityContent] = React.useState("");
  const [isSubmittingActivity, setIsSubmittingActivity] = React.useState(false);

  if (!lead) return null;

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityContent.trim()) return;

    setIsSubmittingActivity(true);
    try {
      await onAddActivity(lead.id, activityType, activityContent);
      setActivityContent("");
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return null;
    const label = outcome.replace(/_/g, " ");
    switch (outcome) {
      case "CONNECTED":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">✅ {label}</span>;
      case "MEETING_FIXED":
        return <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">🤝 {label}</span>;
      case "INTERESTED":
        return <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">💡 {label}</span>;
      case "CALL_BACK":
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">📞 {label}</span>;
      case "NOT_CONNECTED":
      case "BUSY":
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">📵 {label}</span>;
      case "NOT_INTERESTED":
      case "WRONG_NUMBER":
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">❌ {label}</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">📋 {label}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900">{lead.name}</h3>
              <Badge variant={lead.status === "WON" ? "success" : "default"}>
                {lead.status}
              </Badge>
            </div>
            {lead.companyName && (
              <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {lead.companyName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onLogCall && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLogCall(lead)}
                className="text-xs text-sky-700 border-sky-200 hover:bg-sky-50"
              >
                <PhoneCall className="h-3.5 w-3.5 mr-1.5" />
                Log Call
              </Button>
            )}

            {onAddFollowUp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddFollowUp(lead)}
                className="text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                + Follow-up
              </Button>
            )}

            {onScheduleMeeting && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScheduleMeeting(lead)}
                className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Schedule Meeting
              </Button>
            )}

            {lead.convertedClient ? (
              <Badge variant="success" className="px-3 py-1 text-xs">
                ✓ Converted to Client
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConvertLead(lead)}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                CONVERT TO CLIENT
              </Button>
            )}
          </div>
        </div>

        {/* Lead Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Est. Contract Value</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(lead.estimatedValue)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Priority</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {lead.priority}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Source</span>
            {(() => {
              const cfg = getSourceConfig(lead.source);
              return (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold mt-1 ${cfg.badgeClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                  {cfg.emoji} {cfg.label}
                </span>
              );
            })()}
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Next Follow-up</span>
            <span className={`font-semibold mt-0.5 block ${lead.nextFollowUpAt ? "text-teal-700 font-bold" : "text-slate-800"}`}>
              {formatDate(lead.nextFollowUpAt)}
            </span>
          </div>
        </div>

        {/* Contact Info & Assignment Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Contact Details</span>
            {lead.email && (
              <p className="text-xs font-medium text-slate-700 flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                {lead.email}
              </p>
            )}
            {lead.phone && (
              <p className="text-xs font-medium text-slate-700 flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                {lead.phone}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Lead Status"
              value={lead.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              options={[
                { label: "New", value: LeadStatus.NEW },
                { label: "Contacted", value: LeadStatus.CONTACTED },
                { label: "Qualified", value: LeadStatus.QUALIFIED },
                { label: "Meeting", value: LeadStatus.MEETING },
                { label: "Proposal Sent", value: LeadStatus.PROPOSAL_SENT },
                { label: "Negotiation", value: LeadStatus.NEGOTIATION },
                { label: "Won", value: LeadStatus.WON },
                { label: "Lost", value: LeadStatus.LOST },
              ]}
            />
          </div>

          <div>
            <Select
              label="Assigned Co-Founder"
              value={lead.assignedToId || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onAssignChange(lead.id, e.target.value || null)}
              placeholder="Unassigned"
              options={coFounders.map((f) => ({ label: f.name, value: f.id }))}
            />
          </div>
        </div>

        {/* Scheduled Follow-ups List */}
        {lead.followUps && lead.followUps.length > 0 && (
          <div className="space-y-2 bg-teal-50/40 p-3.5 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-teal-600" />
                Scheduled Follow-ups ({lead.followUps.filter((f) => !f.isCompleted).length} Pending)
              </span>
              {onAddFollowUp && (
                <button
                  type="button"
                  onClick={() => onAddFollowUp(lead)}
                  className="text-[11px] font-bold text-teal-700 hover:underline"
                >
                  + Add New
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {lead.followUps.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs bg-white ${
                    f.isCompleted ? "opacity-60 border-slate-100" : "border-teal-100"
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {onToggleFollowUpComplete && (
                      <input
                        type="checkbox"
                        checked={f.isCompleted}
                        onChange={(e) => onToggleFollowUpComplete(f.id, e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {f.type}
                    </Badge>
                    <span className={`truncate ${f.isCompleted ? "line-through text-slate-400" : "text-slate-800 font-medium"}`}>
                      {f.notes || "Follow-up"}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 flex-shrink-0 ml-2">
                    {formatDate(f.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Activity Timeline & Interaction History
            </h4>
          </div>

          {/* Add Activity Form */}
          <form onSubmit={handleAddActivitySubmit} className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <Select
                value={activityType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActivityType(e.target.value as LeadActivityType)}
                options={[
                  { label: "Note", value: LeadActivityType.NOTE },
                  { label: "Call", value: LeadActivityType.CALL },
                  { label: "Email", value: LeadActivityType.EMAIL },
                  { label: "WhatsApp", value: LeadActivityType.WHATSAPP },
                  { label: "Meeting", value: LeadActivityType.MEETING },
                  { label: "Follow-up", value: LeadActivityType.FOLLOW_UP },
                ]}
                className="w-36 h-9 text-xs"
              />
              <Input
                placeholder="Log activity, call notes, or meeting summary..."
                value={activityContent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityContent(e.target.value)}
                className="flex-1 h-9 text-xs bg-white"
              />
              <Button variant="primary" size="sm" type="submit" disabled={isSubmittingActivity}>
                <Send className="h-3.5 w-3.5 mr-1" />
                Log
              </Button>
            </div>
          </form>

          {/* Timeline Feed */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {lead.activities && lead.activities.length > 0 ? (
              lead.activities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 rounded-lg border border-slate-100 p-3 bg-white text-xs">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-[10px]">
                    {act.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.user.name}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">
                        {act.type}
                      </Badge>

                      {act.metadata?.outcome && getOutcomeBadge(act.metadata.outcome)}
                    </div>

                    <p className="text-slate-700">{act.content}</p>

                    {/* Metadata indicators */}
                    {act.metadata?.nextFollowUpAt && (
                      <p className="text-[11px] font-medium text-teal-700 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Next Follow-up: {formatDate(act.metadata.nextFollowUpAt)}
                      </p>
                    )}
                    {act.metadata?.nextMeetingAt && (
                      <p className="text-[11px] font-medium text-indigo-700 flex items-center mt-0.5">
                        <Calendar className="h-3 w-3 mr-1" />
                        Meeting Fixed: {formatDate(act.metadata.nextMeetingAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No activities logged yet.</p>
            )}
          </div>
        </div>

        {/* File Attachments */}
        <NoteAttachments entityType="LEAD" entityId={lead.id} />
      </div>
    </Modal>
  );
}
