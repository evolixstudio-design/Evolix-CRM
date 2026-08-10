"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { QuotationItem, QuotationStatus } from "@/types/quotation";
import { formatDate } from "@/lib/utils";
import { FileText, Building, Mail, Phone, Calendar, ArrowRight, Printer, CheckCircle2 } from "lucide-react";

export interface QuotationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: QuotationItem | null;
  onStatusChange: (id: string, newStatus: QuotationStatus) => Promise<void>;
  onConvertToProject?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function QuotationDetailsModal({
  isOpen,
  onClose,
  quotation,
  onStatusChange,
  onConvertToProject,
  isLoading = false,
}: QuotationDetailsModalProps) {
  if (!quotation) return null;

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as QuotationStatus;
    await onStatusChange(quotation.id, newStatus);
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return <Badge variant="secondary">DRAFT</Badge>;
      case QuotationStatus.SENT:
        return <Badge variant="info">SENT</Badge>;
      case QuotationStatus.VIEWED:
        return <Badge variant="warning">VIEWED</Badge>;
      case QuotationStatus.ACCEPTED:
        return <Badge variant="success">ACCEPTED</Badge>;
      case QuotationStatus.REJECTED:
        return <Badge variant="destructive">REJECTED</Badge>;
      case QuotationStatus.EXPIRED:
        return <Badge variant="outline">EXPIRED</Badge>;
      case QuotationStatus.CONVERTED:
        return <Badge variant="success" className="bg-purple-100 text-purple-800 border-purple-200">CONVERTED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quotation #${quotation.quotationNumber}`}
      className="max-w-4xl"
    >
      <div className="space-y-6 text-slate-800">
        {/* Header & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-900">{quotation.quotationNumber}</h3>
                {getStatusBadge(quotation.status)}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Created by {quotation.createdBy.name} &bull; {formatDate(quotation.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-36">
              <Select
                value={quotation.status}
                onChange={handleStatusSelect}
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
            </div>

            {/* Convert to Project Action Button for ACCEPTED quotations */}
            {quotation.status === QuotationStatus.ACCEPTED && onConvertToProject && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConvertToProject(quotation.id)}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                <ArrowRight className="h-4 w-4 mr-1.5" />
                Convert to Project
              </Button>
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Recipient Contact
            </span>
            <h4 className="font-bold text-base text-slate-900">{quotation.contactName}</h4>
            {quotation.companyName && (
              <p className="text-xs text-slate-600 flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {quotation.companyName}
              </p>
            )}
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            {quotation.email && (
              <p className="flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                {quotation.email}
              </p>
            )}
            {quotation.phone && (
              <p className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                {quotation.phone}
              </p>
            )}
            {quotation.validUntil && (
              <p className="flex items-center font-medium text-amber-700 mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                Valid Until: {formatDate(quotation.validUntil)}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Deliverables & Itemized Breakdown
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
                {quotation.items.map((it, idx) => (
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
              <span>₹{quotation.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {quotation.discountAmount > 0 && (
              <div className="flex justify-between font-medium text-rose-600">
                <span>Discount:</span>
                <span>- ₹{quotation.discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {quotation.taxRate > 0 && (
              <div className="flex justify-between font-medium text-slate-600">
                <span>Tax ({quotation.taxRate}%):</span>
                <span>
                  + ₹
                  {(
                    Math.max(0, quotation.subtotal - quotation.discountAmount) *
                    (quotation.taxRate / 100)
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Amount (INR ₹):</span>
              <span>₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {quotation.terms && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 block">Terms & Conditions</span>
            <p className="text-slate-600 whitespace-pre-wrap">{quotation.terms}</p>
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
