"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LeadItem } from "@/types/lead";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { LEAD_SOURCE_OPTIONS } from "@/lib/lead-source-utils";

export interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  lead?: LeadItem | null;
  coFounders: { id: string; name: string }[];
  isLoading?: boolean;
}

export function LeadFormModal({
  isOpen,
  onClose,
  onSubmit,
  lead,
  coFounders,
  isLoading = false,
}: LeadFormModalProps) {
  const isEditing = Boolean(lead);

  const [name, setName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [service, setService] = React.useState("");
  const [source, setSource] = React.useState<LeadSource>(LeadSource.WEBSITE);
  const [status, setStatus] = React.useState<LeadStatus>(LeadStatus.NEW);
  const [priority, setPriority] = React.useState<LeadPriority>(LeadPriority.MEDIUM);
  const [estimatedValue, setEstimatedValue] = React.useState("");
  const [assignedToId, setAssignedToId] = React.useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (lead) {
      setName(lead.name || "");
      setCompanyName(lead.companyName || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setService(lead.service || "");
      setSource(lead.source || LeadSource.WEBSITE);
      setStatus(lead.status || LeadStatus.NEW);
      setPriority(lead.priority || LeadPriority.MEDIUM);
      setEstimatedValue(lead.estimatedValue !== null ? String(lead.estimatedValue) : "");
      setAssignedToId(lead.assignedToId || "");
      setNextFollowUpAt(
        lead.nextFollowUpAt ? lead.nextFollowUpAt.split("T")[0] : ""
      );
      setNotes(lead.notes || "");
    } else {
      setName("");
      setCompanyName("");
      setEmail("");
      setPhone("");
      setService("");
      setSource(LeadSource.WEBSITE);
      setStatus(LeadStatus.NEW);
      setPriority(LeadPriority.MEDIUM);
      setEstimatedValue("");
      setAssignedToId("");
      setNextFollowUpAt("");
      setNotes("");
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let formattedFollowUpAt: string | null = null;
    if (nextFollowUpAt) {
      const parsedDate = new Date(nextFollowUpAt);
      if (!isNaN(parsedDate.getTime())) {
        formattedFollowUpAt = parsedDate.toISOString();
      }
    }

    const payload = {
      name: name.trim(),
      companyName: companyName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      service: service.trim() || null,
      source,
      status,
      priority,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      assignedToId: assignedToId || null,
      nextFollowUpAt: formattedFollowUpAt,
      notes: notes.trim() || null,
    };
    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Lead Details" : "Create New Lead"}
      description={
        isEditing
          ? "Update opportunity details and follow-up timeline."
          : "Add a new potential client lead to the pipeline."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Lead Name *"
          placeholder="e.g. John Doe / Starlight Media"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Company Name"
            placeholder="e.g. Starlight Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Service Interested"
            placeholder="e.g. Website Redesign"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@starlight.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PhoneInput
            label="Phone / WhatsApp"
            placeholder="98765 43210"
            value={phone}
            onChange={(val) => setPhone(val)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Source *"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            options={LEAD_SOURCE_OPTIONS}
          />

          <Select
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
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

          <Select
            label="Priority *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as LeadPriority)}
            options={[
              { label: "Low", value: LeadPriority.LOW },
              { label: "Medium", value: LeadPriority.MEDIUM },
              { label: "High", value: LeadPriority.HIGH },
              { label: "Urgent", value: LeadPriority.URGENT },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Estimated Contract Value (INR ₹)"
            type="number"
            placeholder="15000"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
          />

          <Select
            label="Assigned Co-Founder"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            placeholder="Unassigned"
            options={coFounders.map((f) => ({ label: f.name, value: f.id }))}
          />
        </div>

        <Input
          label="Next Follow-up Date"
          type="date"
          value={nextFollowUpAt}
          onChange={(e) => setNextFollowUpAt(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Notes & Context</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Enter key details or discovery notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
