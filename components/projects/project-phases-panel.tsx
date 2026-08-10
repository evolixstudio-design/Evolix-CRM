"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, Layers, Calendar, IndianRupee, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ProjectPhaseItem, PhaseStatus } from "@/types/project";
import { formatDate } from "@/lib/utils";

export interface ProjectPhasesPanelProps {
  projectId: string;
  clientId?: string;
  phases: ProjectPhaseItem[];
  overallProgress: number;
  taskCompletionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  projectValue?: number;
  amountReceived?: number;
  amountPending?: number;
  paymentStatus?: string;
  onRefreshProject: () => Promise<void>;
  userRole?: string;
}

export function ProjectPhasesPanel({
  projectId,
  clientId,
  phases = [],
  overallProgress = 0,
  taskCompletionPercentage = 0,
  totalTasks = 0,
  completedTasks = 0,
  projectValue = 0,
  amountReceived = 0,
  amountPending = 0,
  paymentStatus = "UNPAID",
  onRefreshProject,
  userRole = "CO_FOUNDER",
}: ProjectPhasesPanelProps) {
  const [isAddingPhase, setIsAddingPhase] = React.useState(false);
  const [editingPhaseId, setEditingPhaseId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Phase State
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [invoiceId, setInvoiceId] = React.useState("");

  // Edit Phase State
  const [editStatus, setEditStatus] = React.useState<PhaseStatus>(PhaseStatus.NOT_STARTED);
  const [editProgress, setEditProgress] = React.useState(0);
  const [editAmount, setEditAmount] = React.useState("");
  const [editDueDate, setEditDueDate] = React.useState("");

  // Record Payment Modal State
  const [paymentPhaseId, setPaymentPhaseId] = React.useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = React.useState("");

  const PRESET_PHASES = [
    { name: "Phase 1", amount: 30000 },
    { name: "Phase 2", amount: 30000 },
    { name: "Phase 3", amount: 30000 },
    { name: "Phase 4", amount: 30000 },
  ];

  const handleAddPhase = async (phaseName: string, phaseAmt?: number) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: phaseName,
          description: description || null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : (endDate ? new Date(endDate).toISOString() : null),
          amount: phaseAmt !== undefined ? phaseAmt : (amount ? Number(amount) : 0),
          invoiceId: invoiceId || null,
          order: phases.length,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsAddingPhase(false);
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setDueDate("");
        setAmount("");
        setInvoiceId("");
        await onRefreshProject();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePhase = async (phaseId: string, status: PhaseStatus, progress: number, newAmount?: number, newDueDate?: string) => {
    setIsSubmitting(true);
    try {
      const bodyPayload: any = { status, progress };
      if (newAmount !== undefined) bodyPayload.amount = newAmount;
      if (newDueDate !== undefined) bodyPayload.dueDate = newDueDate ? new Date(newDueDate).toISOString() : null;

      const res = await fetch(`/api/projects/phases/${phaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingPhaseId(null);
        await onRefreshProject();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this project phase milestone?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/phases/${phaseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await onRefreshProject();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordMilestonePayment = async () => {
    if (!paymentPhaseId || !paymentAmount || !clientId) return;
    setIsSubmitting(true);
    try {
      const targetPhase = phases.find(p => p.id === paymentPhaseId);
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          projectId,
          phaseId: paymentPhaseId,
          invoiceId: targetPhase?.invoiceId || null,
          amount: Number(paymentAmount),
          paymentDate: new Date().toISOString(),
          method: paymentMethod,
          status: "PAID",
          reference: paymentReference || `Milestone Payment - ${targetPhase?.name || "Phase"}`,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPaymentPhaseId(null);
        setPaymentAmount("");
        setPaymentReference("");
        await onRefreshProject();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentBadge = (pStatus: string) => {
    switch (pStatus) {
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "PARTIALLY_PAID":
      case "PARTIAL":
        return <Badge variant="info">Partially Paid</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="warning">Not Paid</Badge>;
    }
  };

  const getPhaseBadge = (status: PhaseStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">In Progress</Badge>;
      case "ON_HOLD":
        return <Badge variant="warning">On Hold</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      {/* Financial Payment Summary Box (Co-Founder Only) */}
      {userRole === "CO_FOUNDER" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Project Value</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              ₹{projectValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Amount Received</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              ₹{amountReceived.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">Amount Pending</span>
            <span className="text-base font-bold text-amber-300 mt-0.5 block">
              ₹{amountPending.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Payment Status</span>
            <div className="mt-1">
              {getPaymentBadge(paymentStatus)}
            </div>
          </div>
        </div>
      )}

      {/* Progress Breakdown Bar Header */}
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">Project Milestones & Phases</h4>
          </div>
          <span className="text-sm font-black text-teal-700">{overallProgress}% Complete</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Milestones: {phases.length}</span>
          <span>
            Task Completion: {completedTasks}/{totalTasks} tasks ({taskCompletionPercentage}%)
          </span>
        </div>
      </div>

      {/* Quick Start Preset Phases */}
      {phases.length === 0 && !isAddingPhase && userRole === "CO_FOUNDER" && (
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-2 text-xs">
          <p className="font-semibold text-slate-700">Quick Start: Add 4 Milestone Phases (₹30,000 each)</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PHASES.map((pItem) => (
              <button
                key={pItem.name}
                type="button"
                onClick={() => handleAddPhase(pItem.name, pItem.amount)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 font-medium transition-colors"
              >
                + {pItem.name} (₹{pItem.amount.toLocaleString("en-IN")})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Phase Form */}
      {isAddingPhase ? (
        <div className="p-3 border border-teal-200 rounded-lg bg-teal-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900">Add New Milestone / Phase</span>
            <Button variant="ghost" size="sm" onClick={() => setIsAddingPhase(false)} className="h-6 text-xs">
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Milestone Name (e.g. Phase 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Milestone Amount ₹ (e.g. 30000)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              type="date"
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddPhase(name || "Phase", amount ? Number(amount) : 0)}
              disabled={isSubmitting || !name.trim()}
            >
              Add Milestone
            </Button>
          </div>
        </div>
      ) : (
        userRole === "CO_FOUNDER" && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsAddingPhase(true)} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              + Add Milestone / Phase
            </Button>
          </div>
        )
      )}

      {/* Phases List */}
      <div className="space-y-2.5">
        {phases.map((ph) => {
          const isEditing = editingPhaseId === ph.id;
          const phRecAmount = ph.amountReceived || 0;
          const phPendAmount = ph.amountPending || Math.max(0, (ph.amount || 0) - phRecAmount);

          return (
            <div
              key={ph.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                ph.paymentStatus === "PAID" || ph.status === "COMPLETED"
                  ? "bg-slate-50/80 border-slate-200"
                  : ph.paymentStatus === "PARTIAL" || ph.status === "IN_PROGRESS"
                  ? "bg-teal-50/30 border-teal-200"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-bold text-slate-900 text-sm">{ph.name}</span>
                    {getPhaseBadge(ph.status)}
                    {userRole === "CO_FOUNDER" && getPaymentBadge(ph.paymentStatus)}
                    <span className="font-bold text-teal-700">{ph.progress}%</span>
                  </div>

                  {userRole === "CO_FOUNDER" && (
                    <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700 pt-0.5">
                      <span>Amount: <strong className="text-slate-900">₹{(ph.amount || 0).toLocaleString("en-IN")}</strong></span>
                      <span className="text-emerald-600">Received: ₹{phRecAmount.toLocaleString("en-IN")}</span>
                      <span className="text-amber-600">Pending: ₹{phPendAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {ph.description && <p className="text-slate-500 text-[11px]">{ph.description}</p>}

                  <div className="text-[10px] text-slate-400 flex items-center space-x-3 flex-wrap">
                    {ph.dueDate && (
                      <span className="flex items-center font-medium text-slate-600">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                        Due Date: {formatDate(ph.dueDate)}
                      </span>
                    )}
                    {ph.invoiceNumber && (
                      <span className="flex items-center font-semibold text-teal-700">
                        <FileText className="h-3 w-3 mr-1 text-teal-600" />
                        Invoice: #{ph.invoiceNumber}
                      </span>
                    )}
                    {ph.paymentReceivedDate && (
                      <span className="flex items-center text-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid On: {formatDate(ph.paymentReceivedDate)}
                      </span>
                    )}
                  </div>
                </div>

                {userRole === "CO_FOUNDER" && (
                  <div className="flex items-center space-x-1.5 self-end sm:self-center">
                    {ph.paymentStatus !== "PAID" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setPaymentPhaseId(ph.id);
                          setPaymentAmount(String(phPendAmount > 0 ? phPendAmount : ph.amount || 0));
                        }}
                        className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Record Payment
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setEditingPhaseId(null);
                        } else {
                          setEditingPhaseId(ph.id);
                          setEditStatus(ph.status);
                          setEditProgress(ph.progress);
                          setEditAmount(String(ph.amount || 0));
                          setEditDueDate(ph.dueDate ? ph.dueDate.split("T")[0] : "");
                        }
                      }}
                      className="h-7 px-2 text-[11px]"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      {isEditing ? "Done" : "Edit"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePhase(ph.id)}
                      className="h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Progress Bar per Phase */}
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${ph.progress}%` }}
                />
              </div>

              {/* Inline Edit form */}
              {isEditing && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Select
                      label="Phase Status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as PhaseStatus)}
                      options={[
                        { label: "Not Started", value: PhaseStatus.NOT_STARTED },
                        { label: "In Progress", value: PhaseStatus.IN_PROGRESS },
                        { label: "Completed", value: PhaseStatus.COMPLETED },
                        { label: "On Hold", value: PhaseStatus.ON_HOLD },
                      ]}
                    />

                    <Input
                      label="Amount ₹"
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />

                    <Input
                      label="Due Date"
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700">
                        Progress ({editProgress}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editProgress}
                        onChange={(e) => setEditProgress(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdatePhase(ph.id, editStatus, editProgress, Number(editAmount), editDueDate)}
                      disabled={isSubmitting}
                      className="h-6 text-[11px]"
                    >
                      Save Milestone Update
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Record Milestone Payment Modal */}
      {paymentPhaseId && (
        <Modal isOpen={true} onClose={() => setPaymentPhaseId(null)} className="max-w-md">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              💳 Record Milestone Payment
            </h3>

            <div className="space-y-3 text-xs">
              <Input
                label="Payment Amount (INR ₹)"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                  { label: "UPI", value: "UPI" },
                  { label: "Cash", value: "CASH" },
                  { label: "Card", value: "CARD" },
                  { label: "Other", value: "OTHER" },
                ]}
              />

              <Input
                label="Reference / Transaction Notes"
                placeholder="e.g. UTR #, Cheque #, Phase 1 settlement"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setPaymentPhaseId(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRecordMilestonePayment} disabled={isSubmitting || !paymentAmount}>
                Confirm & Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
