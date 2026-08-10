"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentItem } from "@/types/finance";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  payment?: PaymentItem | null;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  isLoading?: boolean;
}

export function PaymentFormModal({
  isOpen,
  onClose,
  onSubmit,
  payment,
  clients,
  projects,
  isLoading = false,
}: PaymentFormModalProps) {
  const isEditing = Boolean(payment);

  const [clientId, setClientId] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState("");
  const [method, setMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [status, setStatus] = React.useState<PaymentStatus>(PaymentStatus.PAID);
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (payment) {
      setClientId(payment.clientId || "");
      setProjectId(payment.projectId || "");
      setAmount(payment.amount !== undefined ? String(payment.amount) : "");
      setPaymentDate(payment.paymentDate ? payment.paymentDate.split("T")[0] : "");
      setMethod(payment.method || PaymentMethod.BANK_TRANSFER);
      setStatus(payment.status || PaymentStatus.PAID);
      setReference(payment.reference || "");
      setNotes(payment.notes || "");
    } else {
      setClientId(clients[0]?.id || "");
      setProjectId("");
      setAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setMethod(PaymentMethod.BANK_TRANSFER);
      setStatus(PaymentStatus.PAID);
      setReference("");
      setNotes("");
    }
  }, [payment, isOpen, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clientId,
      projectId: projectId || null,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate).toISOString(),
      method,
      status,
      reference: reference || null,
      notes: notes || null,
    };
    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Payment Record" : "Record New Payment"}
      description={
        isEditing
          ? "Update payment status, reference code, or date."
          : "Record a client payment transaction into the revenue ledger."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Select
          label="Client Account *"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={clients.map((c) => ({ label: c.name, value: c.id }))}
          required
        />

        <Select
          label="Associated Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="No specific project"
          options={projects.map((p) => ({ label: p.name, value: p.id }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (INR ₹) *"
            type="number"
            placeholder="5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Payment Date *"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Payment Method *"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            options={[
              { label: "Bank Transfer", value: PaymentMethod.BANK_TRANSFER },
              { label: "UPI", value: PaymentMethod.UPI },
              { label: "Cash", value: PaymentMethod.CASH },
              { label: "Card", value: PaymentMethod.CARD },
              { label: "Other", value: PaymentMethod.OTHER },
            ]}
          />

          <Select
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            options={[
              { label: "Paid", value: PaymentStatus.PAID },
              { label: "Pending", value: PaymentStatus.PENDING },
              { label: "Failed", value: PaymentStatus.FAILED },
              { label: "Refunded", value: PaymentStatus.REFUNDED },
            ]}
          />
        </div>

        <Input
          label="Payment Reference / Transaction ID"
          placeholder="e.g. TXN-98402 / INV-004"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Notes & Context</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Milestone invoice notes or bank transfer memo..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Payment" : "Record Payment"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
