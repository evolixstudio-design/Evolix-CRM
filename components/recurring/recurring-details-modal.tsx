"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecurringContractItem } from "@/types/recurring";
import { formatDate } from "@/lib/utils";
import { Calendar, FileText, CheckCircle2, Clock, Zap } from "lucide-react";

export interface RecurringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: RecurringContractItem | null;
  onRefresh: () => Promise<void>;
}

export function RecurringDetailsModal({
  isOpen,
  onClose,
  contract,
  onRefresh,
}: RecurringDetailsModalProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!contract) return null;

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/recurring/${contract.id}/generate-invoices`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active Deal</Badge>;
      case "PAUSED":
        return <Badge variant="warning">Paused</Badge>;
      case "COMPLETED":
        return <Badge variant="info">Completed</Badge>;
      default:
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  const getPeriodStatusBadge = (status: string, invoiceNumber?: string | null) => {
    if (invoiceNumber || status === "INVOICED" || status === "PAID") {
      return <Badge variant="success">Invoiced #{invoiceNumber || "Generated"}</Badge>;
    }
    if (status === "OVERDUE") {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="default">Scheduled Pending</Badge>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900">{contract.title}</h3>
              {getStatusBadge(contract.status)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Client: <strong className="text-slate-800">{contract.client.name}</strong>{" "}
              {contract.client.companyName && `(${contract.client.companyName})`}
              {contract.project && ` • Project: ${contract.project.name}`}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Zap className="h-4 w-4 mr-1.5" />
            {isGenerating ? "Generating..." : "Generate Scheduled Invoices"}
          </Button>
        </div>

        {/* Financial Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Amount</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              ₹{contract.monthlyAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Duration</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">
              {contract.durationMonths} Months ({contract.billingFrequency})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Total Contract Value</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              ₹{contract.totalContractValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-amber-300 font-semibold uppercase block">Invoices Generated</span>
            <span className="text-base font-bold text-amber-300 mt-0.5 block">
              {contract.generatedInvoicesCount} / {contract.durationMonths} Periods
            </span>
          </div>
        </div>

        {/* 12 Billing Periods Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Billing Schedule & Period Breakdown ({contract.billingPeriods.length} Periods)
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Billing Window</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Amount (INR ₹)</th>
                  <th className="py-2.5 px-3">Status / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contract.billingPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      Period #{p.periodNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {formatDate(p.periodStartDate)} – {formatDate(p.periodEndDate)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {formatDate(p.dueDate)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3">
                      {getPeriodStatusBadge(p.status, p.invoiceNumber)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {contract.notes && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-600 block">Notes & Terms</span>
            <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
              {contract.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
