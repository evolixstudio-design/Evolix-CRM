"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/types/project";
import { ProjectServiceType, ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  project?: ProjectItem | null;
  clients: { id: string; name: string }[];
  teamMembers: { id: string; name: string }[];
  userRole?: string;
  isLoading?: boolean;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  clients,
  teamMembers,
  userRole = "CO_FOUNDER",
  isLoading = false,
}: ProjectFormModalProps) {
  const isEditing = Boolean(project);

  const [clientId, setClientId] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [serviceType, setServiceType] = React.useState<ProjectServiceType>(ProjectServiceType.WEBSITE);
  const [status, setStatus] = React.useState<ProjectStatus>(ProjectStatus.PLANNING);
  const [priority, setPriority] = React.useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [startDate, setStartDate] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [contractValue, setContractValue] = React.useState("");
  const [currency, setCurrency] = React.useState("INR");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(PaymentStatus.UNPAID);
  const [contractType, setContractType] = React.useState("FIXED_PRICE");
  const [duration, setDuration] = React.useState("");
  const [ownerId, setOwnerId] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (project) {
      setClientId(project.clientId || "");
      setName(project.name || "");
      setDescription(project.description || "");
      setServiceType(project.serviceType || ProjectServiceType.WEBSITE);
      setStatus(project.status || ProjectStatus.PLANNING);
      setPriority(project.priority || ProjectPriority.MEDIUM);
      setStartDate(project.startDate ? project.startDate.split("T")[0] : "");
      setDeadline(project.deadline ? project.deadline.split("T")[0] : "");
      setContractValue(project.contractValue !== undefined && project.contractValue !== null ? String(project.contractValue) : "");
      setCurrency(project.currency || "INR");
      setPaymentStatus(project.paymentStatus || PaymentStatus.UNPAID);
      setContractType(project.contractType || "FIXED_PRICE");
      setDuration(project.duration || "");
      setOwnerId(project.ownerId || "");
      setSelectedMemberIds((project.members || []).map((m) => m.userId));
      setNotes(project.notes || "");
    } else {
      setClientId(clients[0]?.id || "");
      setName("");
      setDescription("");
      setServiceType(ProjectServiceType.WEBSITE);
      setStatus(ProjectStatus.PLANNING);
      setPriority(ProjectPriority.MEDIUM);
      setStartDate("");
      setDeadline("");
      setContractValue("");
      setCurrency("INR");
      setPaymentStatus(PaymentStatus.UNPAID);
      setContractType("FIXED_PRICE");
      setDuration("");
      setOwnerId(teamMembers[0]?.id || "");
      setSelectedMemberIds([]);
      setNotes("");
    }
  }, [project, isOpen, clients, teamMembers]);

  const toggleMemberSelection = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clientId,
      name,
      description: description || null,
      serviceType,
      status,
      priority,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      contractValue: contractValue ? parseFloat(contractValue) : null,
      currency,
      paymentStatus,
      contractType,
      duration: duration.trim() || null,
      ownerId: ownerId || null,
      memberIds: selectedMemberIds,
      notes: notes || null,
    };
    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "Create Project"}
      description="Configure project details, Team Leader, duration, phases, and contract value."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        {!isEditing && (
          <Select
            label="Client *"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            options={clients.map((c) => ({ label: c.name, value: c.id }))}
          />
        )}

        <Input
          label="Project Name *"
          placeholder="e.g. HyperDrive E-Commerce Portal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Service Category *"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ProjectServiceType)}
            options={[
              { label: "🌐 Website Development", value: ProjectServiceType.WEBSITE },
              { label: "💻 Custom Software", value: ProjectServiceType.SOFTWARE },
              { label: "🎨 Branding & Design", value: ProjectServiceType.BRANDING },
              { label: "📱 E-Commerce Platform", value: ProjectServiceType.ECOMMERCE },
              { label: "🚀 Digital Marketing", value: ProjectServiceType.DIGITAL_MARKETING },
              { label: "🤖 AI & Automation", value: ProjectServiceType.AI_AUTOMATION },
              { label: "🔍 SEO & Analytics", value: ProjectServiceType.SEO },
              { label: "⚙️ Custom Service", value: ProjectServiceType.OTHER },
            ]}
          />

          <Select
            label="Team Leader (Co-Founder) *"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            options={teamMembers.map((m) => ({ label: `👤 ${m.name}`, value: m.id }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Project Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={[
              { label: "Planning", value: ProjectStatus.PLANNING },
              { label: "In Progress", value: ProjectStatus.IN_PROGRESS },
              { label: "On Hold", value: ProjectStatus.ON_HOLD },
              { label: "Completed", value: ProjectStatus.COMPLETED },
              { label: "Cancelled", value: ProjectStatus.CANCELLED },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            options={[
              { label: "Low", value: ProjectPriority.LOW },
              { label: "Medium", value: ProjectPriority.MEDIUM },
              { label: "High", value: ProjectPriority.HIGH },
              { label: "Urgent", value: ProjectPriority.URGENT },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Deadline Date"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Duration"
            placeholder="e.g. 3 Months"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {/* Financial & Contract Settings (Co-Founder Only) */}
        {userRole === "CO_FOUNDER" && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Financial & Contract Settings (INR ₹ Default)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Contract Value (₹)"
                type="number"
                step="0.01"
                placeholder="150000"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
              />

              <Select
                label="Contract Type"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                options={[
                  { label: "Fixed Price", value: "FIXED_PRICE" },
                  { label: "Monthly Retainer", value: "RETAINER" },
                  { label: "Milestone Based", value: "MILESTONE" },
                  { label: "Hourly Rate", value: "HOURLY" },
                ]}
              />

              <Select
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                options={[
                  { label: "Unpaid", value: PaymentStatus.UNPAID },
                  { label: "Partial Paid", value: PaymentStatus.PARTIAL },
                  { label: "Fully Paid", value: PaymentStatus.PAID },
                ]}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Project Overview & Description</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Key deliverables, tech stack details, target milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Team Members Assignment */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Assign Team Members</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
            {teamMembers.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMemberSelection(member.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    isSelected
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
