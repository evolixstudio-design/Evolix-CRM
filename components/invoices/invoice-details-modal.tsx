"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { InvoiceItem, InvoiceStatus } from "@/types/invoice";
import { formatDate } from "@/lib/utils";
import { CreditCard, Building, FolderKanban, Calendar, Printer, Mail, Phone } from "lucide-react";

export interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
  onStatusChange: (id: string, newStatus: InvoiceStatus) => Promise<void>;
  isLoading?: boolean;
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  onStatusChange,
  isLoading = false,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as InvoiceStatus;
    await onStatusChange(invoice.id, newStatus);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <Badge variant="secondary">DRAFT</Badge>;
      case InvoiceStatus.SENT:
        return <Badge variant="info">SENT</Badge>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <Badge variant="warning">PARTIALLY PAID</Badge>;
      case InvoiceStatus.PAID:
        return <Badge variant="success">PAID</Badge>;
      case InvoiceStatus.OVERDUE:
        return <Badge variant="destructive">OVERDUE</Badge>;
      case InvoiceStatus.CANCELLED:
        return <Badge variant="outline">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice #${invoice.invoiceNumber}`}
      className="max-w-4xl"
    >
      <div className="space-y-6 text-slate-800">
        {/* Header & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-900">{invoice.invoiceNumber}</h3>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Issued: {formatDate(invoice.issueDate)} &bull; Due: {invoice.dueDate ? formatDate(invoice.dueDate) : "On Receipt"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-36">
              <Select
                value={invoice.status}
                onChange={handleStatusSelect}
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
          </div>
        </div>

        {/* Client & Project Connection Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To (Client)
            </span>
            <h4 className="font-bold text-base text-slate-900">{invoice.client.name}</h4>
            {invoice.client.companyName && (
              <p className="text-xs text-slate-600 flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {invoice.client.companyName}
              </p>
            )}
            <div className="space-y-1 text-xs text-slate-500 mt-2">
              {invoice.client.email && (
                <p className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  {invoice.client.email}
                </p>
              )}
              {invoice.client.phone && (
                <p className="flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  {invoice.client.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            {invoice.project ? (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Associated Project
                </span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                    <FolderKanban className="h-3.5 w-3.5 text-teal-600" />
                    <span>{invoice.project.name}</span>
                  </div>
                  {invoice.project.serviceType && (
                    <p className="text-[11px] text-slate-500">Service: {invoice.project.serviceType}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No direct project attached (Direct Client Billing).</div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Invoice Line Items
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-900">{it.description}</td>
                    <td className="p-3 text-center font-semibold">{it.quantity}</td>
                    <td className="p-3 text-right font-medium">₹{it.unitRate.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{((it.quantity || 1) * (it.unitRate || 0)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Calculation Box */}
        <div className="flex justify-end">
          <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between font-medium text-rose-600">
                <span>Discount:</span>
                <span>- ₹{invoice.discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between font-medium text-slate-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>
                  + ₹
                  {(
                    Math.max(0, invoice.subtotal - invoice.discountAmount) *
                    (invoice.taxRate / 100)
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Invoice Amount (INR ₹):</span>
              <span>₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {invoice.terms && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 block">Payment Terms & Instructions</span>
            <p className="text-slate-600 whitespace-pre-wrap">{invoice.terms}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
