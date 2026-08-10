"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OnboardingItem } from "@/types/client";
import { OnboardingStatus } from "@prisma/client";
import { NoteAttachments } from "@/components/ui/note-attachments";

export interface OnboardingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (onboardingId: string, payload: any) => Promise<void>;
  onboarding: OnboardingItem | null;
  isLoading?: boolean;
}

export function OnboardingUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  onboarding,
  isLoading = false,
}: OnboardingUpdateModalProps) {
  const [status, setStatus] = React.useState<OnboardingStatus>(OnboardingStatus.NOT_STARTED);
  const [businessInfo, setBusinessInfo] = React.useState("");
  const [contactInfo, setContactInfo] = React.useState("");
  const [services, setServices] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [targetEndDate, setTargetEndDate] = React.useState("");
  const [dealInfo, setDealInfo] = React.useState("");
  const [documents, setDocuments] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (onboarding) {
      setStatus(onboarding.status || OnboardingStatus.NOT_STARTED);
      setBusinessInfo(onboarding.businessInfo || "");
      setContactInfo(onboarding.contactInfo || "");
      setServices(onboarding.services || "");
      setStartDate(onboarding.startDate ? onboarding.startDate.split("T")[0] : "");
      setTargetEndDate(onboarding.targetEndDate ? onboarding.targetEndDate.split("T")[0] : "");
      setDealInfo(onboarding.dealInfo || "");
      setDocuments(onboarding.documents || "");
      setNotes(onboarding.notes || "");
    }
  }, [onboarding, isOpen]);

  if (!onboarding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(onboarding.id, {
      status,
      businessInfo: businessInfo.trim() || null,
      contactInfo: contactInfo.trim() || null,
      services: services.trim() || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : null,
      dealInfo: dealInfo.trim() || null,
      documents: documents.trim() || null,
      notes: notes.trim() || null,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Onboarding: ${onboarding.clientName}`}
      description="Manage onboarding workflow milestones, business details, services scope, documents, and notes."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Select
          label="Workflow Status *"
          value={status}
          onChange={(e) => setStatus(e.target.value as OnboardingStatus)}
          options={[
            { label: "Not Started", value: OnboardingStatus.NOT_STARTED },
            { label: "In Progress", value: OnboardingStatus.IN_PROGRESS },
            { label: "Waiting for Client", value: OnboardingStatus.WAITING_FOR_CLIENT },
            { label: "Completed", value: OnboardingStatus.COMPLETED },
            { label: "Cancelled", value: OnboardingStatus.CANCELLED },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Business Information"
            placeholder="Tax ID / GST / Reg. Details"
            value={businessInfo}
            onChange={(e) => setBusinessInfo(e.target.value)}
          />
          <Input
            label="Services Scope"
            placeholder="e.g. Website + CRM Integration"
            value={services}
            onChange={(e) => setServices(e.target.value)}
          />
        </div>

        <Input
          label="Contact Information"
          placeholder="Primary contact name, email, phone"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Target End Date"
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Deal / Financial Information"
          placeholder="e.g. ₹1,50,000 Total Deal Value"
          value={dealInfo}
          onChange={(e) => setDealInfo(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Documents & Required Checklist</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="List required documents (e.g. Brand Guidelines PDF, Domain Access, Signed Agreement)..."
            value={documents}
            onChange={(e) => setDocuments(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Notes & Kickoff Discussion</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Record kickoff meeting notes, client credentials status, or special requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* File Attachments */}
        <NoteAttachments entityType="ONBOARDING" entityId={onboarding.id} compact />

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Update Onboarding"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
