"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QuotationItem, QuotationItemData, QuotationStatus } from "@/types/quotation";
import { Plus, Trash2, Zap } from "lucide-react";

import { PhoneInput } from "@/components/ui/phone-input";

export interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  quotation?: QuotationItem | null;
  leads: { id: string; name: string; companyName?: string | null; company?: string | null; email?: string | null; phone?: string | null }[];
  isLoading?: boolean;
}

export function QuotationFormModal({
  isOpen,
  onClose,
  onSubmit,
  quotation,
  leads = [],
  isLoading = false,
}: QuotationFormModalProps) {
  const isEditing = Boolean(quotation);

  const [leadId, setLeadId] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<QuotationStatus>(QuotationStatus.DRAFT);
  const [currency, setCurrency] = React.useState("INR");
  const [discountAmount, setDiscountAmount] = React.useState("0");
  const [taxRate, setTaxRate] = React.useState("18"); // Default 18% GST/Tax
  const [validUntil, setValidUntil] = React.useState("");
  const [terms, setTerms] = React.useState("Payment terms: 50% advance upon acceptance, 50% upon delivery.");
  const [notes, setNotes] = React.useState("");

  const [items, setItems] = React.useState<QuotationItemData[]>([
    { description: "Website Development & UI/UX Design", quantity: 1, unitRate: 75000 },
  ]);

  React.useEffect(() => {
    if (quotation) {
      setLeadId(quotation.leadId || "");
      setContactName(quotation.contactName || "");
      setCompanyName(quotation.companyName || "");
      setEmail(quotation.email || "");
      setPhone(quotation.phone || "");
      setStatus(quotation.status || QuotationStatus.DRAFT);
      setCurrency(quotation.currency || "INR");
      setDiscountAmount(String(quotation.discountAmount || 0));
      setTaxRate(String(quotation.taxRate || 0));
      setValidUntil(quotation.validUntil ? quotation.validUntil.split("T")[0] : "");
      setTerms(quotation.terms || "");
      setNotes(quotation.notes || "");
      setItems(quotation.items && quotation.items.length > 0 ? quotation.items : [{ description: "", quantity: 1, unitRate: 0 }]);
    } else {
      setLeadId("");
      setContactName("");
      setCompanyName("");
      setEmail("");
      setPhone("");
      setStatus(QuotationStatus.DRAFT);
      setCurrency("INR");
      setDiscountAmount("0");
      setTaxRate("18");
      const defaultValid = new Date();
      defaultValid.setDate(defaultValid.getDate() + 30);
      setValidUntil(defaultValid.toISOString().split("T")[0]);
      setTerms("Payment terms: 50% advance upon acceptance, 50% upon delivery.");
      setNotes("");
      setItems([{ description: "Website Development & UI/UX Design", quantity: 1, unitRate: 75000 }]);
    }
  }, [quotation, isOpen]);

  const handleLeadSelect = (selectedId: string) => {
    setLeadId(selectedId);
    if (selectedId) {
      const selectedLead = leads.find((l) => l.id === selectedId);
      if (selectedLead) {
        setContactName(selectedLead.name || "");
        setCompanyName(selectedLead.companyName || selectedLead.company || "");
        setEmail(selectedLead.email || "");
        setPhone(selectedLead.phone || "");
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

  const handleItemChange = (index: number, field: keyof QuotationItemData, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Financial Calculations
  const calculatedSubtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitRate) || 0), 0);
  const discountNum = parseFloat(discountAmount) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxable = Math.max(0, calculatedSubtotal - discountNum);
  const calculatedTax = taxable * (taxRateNum / 100);
  const calculatedTotal = taxable + calculatedTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      leadId: leadId || null,
      contactName,
      companyName: companyName || null,
      email: email || null,
      phone: phone || null,
      status,
      currency,
      discountAmount: discountNum,
      taxRate: taxRateNum,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
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
      title={isEditing ? `Edit Quotation ${quotation?.quotationNumber}` : "Create New Quotation"}
      description="Prepare custom client proposal with line items, default INR ₹ currency, tax %, and auto-populated lead info."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        {/* Lead Selection & Auto-Fill */}
        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Auto-Fill from CRM Lead
            </span>
            <Zap className="h-3.5 w-3.5 text-amber-600" />
          </div>

          <Select
            label="Select Lead (Optional)"
            value={leadId}
            onChange={(e) => handleLeadSelect(e.target.value)}
            options={[
              { label: "None / Custom Prospect", value: "" },
              ...leads.map((l) => ({ label: `${l.name} (${l.company || "No Company"})`, value: l.id })),
            ]}
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contact Person Name *"
            placeholder="e.g. Rahul Sharma"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <Input
            label="Company Name"
            placeholder="e.g. Apex Global Solutions"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="client@apex.com"
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

        {/* Line Items Table */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Itemized Deliverables & Pricing *
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
                      placeholder="Service or deliverable name..."
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

        {/* Calculations Summary Box */}
        <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-200 space-y-2 text-xs">
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

          <div className="flex justify-between font-black text-sm text-emerald-950 border-t border-emerald-200 pt-2">
            <span>Total Quotation Amount (INR ₹):</span>
            <span>₹{calculatedTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Status & Validity */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Quotation Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as QuotationStatus)}
            options={[
              { label: "Draft", value: QuotationStatus.DRAFT },
              { label: "Sent", value: QuotationStatus.SENT },
              { label: "Viewed", value: QuotationStatus.VIEWED },
              { label: "Accepted", value: QuotationStatus.ACCEPTED },
              { label: "Rejected", value: QuotationStatus.REJECTED },
              { label: "Expired", value: QuotationStatus.EXPIRED },
              { label: "Converted", value: QuotationStatus.CONVERTED },
            ]}
          />

          <Input
            label="Valid Until Date"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>

        {/* Terms & Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Terms & Conditions</label>
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
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
