"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface RecurringDealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: { id: string; name: string; companyName?: string | null }[];
  projects: { id: string; name: string; clientId: string }[];
}

export function RecurringDealFormModal({
  isOpen,
  onClose,
  onSuccess,
  clients = [],
  projects = [],
}: RecurringDealFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const [title, setTitle] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [durationMonths, setDurationMonths] = React.useState(12);
  const [billingFrequency, setBillingFrequency] = React.useState("MONTHLY");
  const [monthlyAmount, setMonthlyAmount] = React.useState(50000);
  const [currency, setCurrency] = React.useState("INR");
  const [notes, setNotes] = React.useState("");

  const filteredProjects = projects.filter((p) => !clientId || p.clientId === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId || !startDate || !monthlyAmount) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientId,
          projectId: projectId || null,
          startDate: new Date(startDate).toISOString(),
          durationMonths: Number(durationMonths),
          billingFrequency,
          monthlyAmount: Number(monthlyAmount),
          currency,
          notes: notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create recurring brand deal.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalContractVal = (Number(monthlyAmount) || 0) * (Number(durationMonths) || 12);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">⚡ Create Recurring Brand Deal</h3>
          <p className="text-xs text-slate-500">
            Configure long-term brand retainers with auto-calculated schedule billing periods.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <Input
            label="Deal Title *"
            placeholder="e.g. 12-Month Brand Retainer - Acme Corp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Client *"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
              }}
              options={clients.map((c) => ({
                label: `${c.name} ${c.companyName ? `(${c.companyName})` : ""}`,
                value: c.id,
              }))}
              placeholder="Select Client"
              required
            />

            <Select
              label="Associated Project (Optional)"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              options={filteredProjects.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              placeholder="Select Project"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <Input
              label="Duration (Months) *"
              type="number"
              min="1"
              max="60"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              required
            />

            <Select
              label="Billing Frequency"
              value={billingFrequency}
              onChange={(e) => setBillingFrequency(e.target.value)}
              options={[
                { label: "Monthly", value: "MONTHLY" },
                { label: "Quarterly", value: "QUARTERLY" },
                { label: "Annually", value: "ANNUALLY" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Monthly Amount (INR ₹) *"
              type="number"
              placeholder="50000"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              required
            />

            <div className="bg-slate-900 text-white p-3 rounded-lg flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Contract Value</span>
              <span className="text-base font-extrabold text-emerald-400">
                ₹{totalContractVal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Input
            label="Notes / Terms (Optional)"
            placeholder="e.g. Scope includes monthly content deliverables & social ads"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Contract..." : "Confirm & Create Brand Deal"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
