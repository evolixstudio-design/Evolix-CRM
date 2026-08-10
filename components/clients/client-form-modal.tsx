"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClientItem } from "@/types/client";
import { ClientStatus, LeadSource } from "@prisma/client";

export interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  client?: ClientItem | null;
  coFounders: { id: string; name: string }[];
  interns?: { id: string; name: string }[];
  userRole?: string;
  isLoading?: boolean;
}

export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  client,
  coFounders,
  interns = [],
  userRole = "CO_FOUNDER",
  isLoading = false,
}: ClientFormModalProps) {
  const isEditing = Boolean(client);

  const [name, setName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [status, setStatus] = React.useState<ClientStatus>(ClientStatus.ONBOARDING);
  const [source, setSource] = React.useState<string>("");
  const [assignedToId, setAssignedToId] = React.useState("");
  const [assignedInternId, setAssignedInternId] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (client) {
      setName(client.name || "");
      setCompanyName(client.companyName || "");
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setWhatsapp(client.whatsapp || "");
      setAddress(client.address || "");
      setWebsite(client.website || "");
      setIndustry(client.industry || "");
      setStatus(client.status || ClientStatus.ONBOARDING);
      setSource(client.source || "");
      setAssignedToId(client.assignedToId || "");
      setAssignedInternId(client.assignedInternId || "");
      setNotes(client.notes || "");
    } else {
      setName("");
      setCompanyName("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setAddress("");
      setWebsite("");
      setIndustry("");
      setStatus(ClientStatus.ONBOARDING);
      setSource("");
      setAssignedToId("");
      setAssignedInternId("");
      setNotes("");
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      companyName: companyName || null,
      email: email || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      address: address || null,
      website: website || null,
      industry: industry || null,
      status,
      source: source || null,
      assignedToId: assignedToId || null,
      assignedInternId: assignedInternId || null,
      notes: notes || null,
    };
    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Client Account" : "Create New Client Account"}
      description={
        isEditing
          ? "Update client contact information, status, or account manager."
          : "Add a new client to the directory. Associated onboarding will be created automatically."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Client / Contact Name *"
          placeholder="e.g. John Doe / Apex Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Company Name"
            placeholder="e.g. Apex Logistics"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Industry"
            placeholder="e.g. E-Commerce / Tech"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="contact@apex.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PhoneInput
            label="Phone Number"
            placeholder="98765 43210"
            value={phone}
            onChange={(val) => setPhone(val)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PhoneInput
            label="WhatsApp"
            placeholder="98765 43210"
            value={whatsapp}
            onChange={(val) => setWhatsapp(val)}
          />
          <Input
            label="Website URL"
            placeholder="https://apex.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            options={[
              { label: "Onboarding", value: ClientStatus.ONBOARDING },
              { label: "Active", value: ClientStatus.ACTIVE },
              { label: "On Hold", value: ClientStatus.ON_HOLD },
              { label: "Completed", value: ClientStatus.COMPLETED },
              { label: "Inactive", value: ClientStatus.INACTIVE },
              { label: "Archived", value: ClientStatus.ARCHIVED },
            ]}
          />

          <Select
            label="Acquisition Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Select Source"
            options={[
              { label: "Website", value: LeadSource.WEBSITE },
              { label: "LinkedIn", value: LeadSource.LINKEDIN },
              { label: "Upwork", value: LeadSource.UPWORK },
              { label: "Referral", value: LeadSource.REFERRAL },
              { label: "Cold Outreach", value: LeadSource.COLD_OUTREACH },
              { label: "Other", value: LeadSource.OTHER },
            ]}
          />
        </div>

        {userRole === "CO_FOUNDER" && (
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Team Leader (Co-Founder)"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              placeholder="Select Team Leader"
              options={coFounders.map((f) => ({ label: f.name, value: f.id }))}
            />

            <Select
              label="Assigned Intern"
              value={assignedInternId}
              onChange={(e) => setAssignedInternId(e.target.value)}
              placeholder="Select Intern"
              options={interns.map((i) => ({ label: i.name, value: i.id }))}
            />
          </div>
        )}

        <Input
          label="Address"
          placeholder="e.g. 100 Main St, Suite 400"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Account Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Account preferences, billing notes, or background..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Client" : "Create Client"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
