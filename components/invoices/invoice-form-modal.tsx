"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InvoiceItem, InvoiceItemData, InvoiceStatus } from "@/types/invoice";
import { Plus, Trash2, FolderKanban, Building } from "lucide-react";

export interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  invoice?: InvoiceItem | null;
  projects: { id: string; name: string; clientId: string }[];
  clients: { id: string; name: string; companyName?: string | null }[];
  isLoading?: boolean;
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  projects = [],
  clients = [],
  isLoading = false,
}: InvoiceFormModalProps) {
  const isEditing = Boolean(invoice);

  const [projectId, setProjectId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [status, setStatus] = React.useState<InvoiceStatus>(InvoiceStatus.DRAFT);
  const [issueDate, setIssueDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [currency, setCurrency] = React.useState("INR");
  const [discountAmount, setDiscountAmount] = React.useState("0");
  const [taxRate, setTaxRate] = React.useState("18");
  const [terms, setTerms] = React.useState("Payment due within 14 days of invoice issue date. Bank transfer or UPI accepted.");
  const [notes, setNotes] = React.useState("");

  const [items, setItems] = React.useState<InvoiceItemData[]>([
    { description: "Software Development Services — Phase Deliverable", quantity: 1, unitRate: 50000 },
  ]);

  React.useEffect(() => {
    if (invoice) {
      setProjectId(invoice.projectId || "");
      setClientId(invoice.clientId || "");
      setStatus(invoice.status || InvoiceStatus.DRAFT);
      setIssueDate(invoice.issueDate ? invoice.issueDate.split("T")[0] : "");
      setDueDate(invoice.dueDate ? invoice.dueDate.split("T")[0] : "");
      setCurrency(invoice.currency || "INR");
      setDiscountAmount(String(invoice.discountAmount || 0));
      setTaxRate(String(invoice.taxRate || 0));
      setTerms(invoice.terms || "");
      setNotes(invoice.notes || "");
      setItems(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: "", quantity: 1, unitRate: 0 }]);
    } else {
      setProjectId("");
      setClientId("");
      setStatus(InvoiceStatus.DRAFT);
      const today = new Date().toISOString().split("T")[0];
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setIssueDate(today);
      setDueDate(defaultDue.toISOString().split("T")[0]);
      setCurrency("INR");
      setDiscountAmount("0");
      setTaxRate("18");
      setTerms("Payment due within 14 days of invoice issue date. Bank transfer or UPI accepted.");
      setNotes("");
      setItems([{ description: "Software Development Services — Phase Deliverable", quantity: 1, unitRate: 50000 }]);
    }
  }, [invoice, isOpen]);

  const handleProjectSelect = (selectedProjId: string) => {
    setProjectId(selectedProjId);
    if (selectedProjId) {
      const proj = projects.find((p) => p.id === selectedProjId);
      if (proj && proj.clientId) {
        setClientId(proj.clientId);
      }
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemData, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const calculatedSubtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitRate) || 0), 0);
  const discountNum = parseFloat(discountAmount) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxable = Math.max(0, calculatedSubtotal - discountNum);
  const calculatedTax = taxable * (taxRateNum / 100);
  const calculatedTotal = taxable + calculatedTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      projectId: projectId || null,
      clientId,
      status,
      issueDate: issueDate ? new Date(issueDate).toISOString() : new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      currency,
      discountAmount: discountNum,
      taxRate: taxRateNum,
      terms: terms || null,
      notes: notes || null,
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitRate: Number(it.unitRate) || 0,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Invoice ${invoice?.invoiceNumber}` : "Generate New Invoice"}
      description="Create client invoice originating from a Project or Client with line items, default INR ₹ currency, and tax %."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        {/* Project & Client Selection */}
        <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Select Project (Optional)"
              value={projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              options={[
                { label: "None / Direct Client Billing", value: "" },
                ...projects.map((p) => ({ label: p.name, value: p.id })),
              ]}
            />

            <Select
              label="Select Client *"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              options={[
                { label: "-- Select Client --", value: "" },
                ...clients.map((c) => ({ label: `${c.name} (${c.companyName || "No Company"})`, value: c.id })),
              ]}
            />
          </div>
        </div>

        {/* Dates & Status */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Issue Date *"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Input
            label="Due Date *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Select
            label="Invoice Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            options={[
              { label: "Draft", value: InvoiceStatus.DRAFT },
              { label: "Sent", value: InvoiceStatus.SENT },
              { label: "Partially Paid", value: InvoiceStatus.PARTIALLY_PAID },
              { label: "Paid", value: InvoiceStatus.PAID },
              { label: "Overdue", value: InvoiceStatus.OVERDUE },
              { label: "Cancelled", value: InvoiceStatus.CANCELLED },
            ]}
          />
        </div>

        {/* Line Items Dynamic Table */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Itemized Line Items & Pricing *
            </label>
            <Button variant="outline" size="sm" type="button" onClick={handleAddItem} className="h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {items.map((it, idx) => {
              const lineAmount = (Number(it.quantity) || 0) * (Number(it.unitRate) || 0);
              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="col-span-6">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Description #{idx + 1}
                    </label>
                    <input
                      type="text"
                      placeholder="Service or deliverable description..."
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      required
                      className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value, 10) || 1)}
                      required
                      className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.unitRate}
                      onChange={(e) => handleItemChange(idx, "unitRate", parseFloat(e.target.value) || 0)}
                      required
                      className="w-full text-xs rounded border border-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end pb-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculations Box */}
        <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-200 space-y-2 text-xs">
          <div className="flex justify-between font-semibold text-slate-700">
            <span>Subtotal:</span>
            <span>₹{calculatedSubtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Input
              label="Discount Amount (₹)"
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>

          <div className="flex justify-between font-black text-sm text-teal-950 border-t border-teal-200 pt-2">
            <span>Total Invoice Amount (INR ₹):</span>
            <span>₹{calculatedTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Payment Terms</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Generate Invoice"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
