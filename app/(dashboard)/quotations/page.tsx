"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { QuotationFormModal } from "@/components/quotations/quotation-form-modal";
import { QuotationDetailsModal } from "@/components/quotations/quotation-details-modal";
import { QuotationItem, QuotationStatus } from "@/types/quotation";
import { formatDate } from "@/lib/utils";

export default function QuotationsPage() {
  const [quotations, setQuotations] = React.useState<QuotationItem[]>([]);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  // Modals
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedQuotation, setSelectedQuotation] = React.useState<QuotationItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const fetchQuotations = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to fetch quotations.");
        setIsLoading(false);
        return;
      }

      setQuotations(json.data.quotations || []);
      setTotalPages(json.data.totalPages || 1);
      setTotalCount(json.data.total || 0);
    } catch (e) {
      setErrorMsg("Network error fetching quotations.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads?limit=100");
      const json = await res.json();
      if (res.ok && json.success) {
        setLeads(json.data.leads || []);
      }
    } catch (e) {
      console.error("Failed to load leads for quotation modal", e);
    }
  };

  React.useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateQuotation = async (formData: any) => {
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Create Failed", message: json.error?.message || "Failed to create quotation." });
        return;
      }

      setToast({ type: "success", title: "Quotation Created", message: `Quotation #${json.data.quotationNumber} generated successfully.` });
      setIsFormOpen(false);
      fetchQuotations();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error creating quotation." });
    }
  };

  const handleStatusChange = async (id: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setToast({ type: "success", title: "Status Updated", message: `Quotation status updated to ${newStatus}` });
        fetchQuotations();
        if (selectedQuotation?.id === id) {
          setSelectedQuotation(json.data);
        }
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to update quotation status." });
    }
  };

  const handleConvertToProject = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}/convert`, { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Conversion Failed", message: json.error?.message || "Failed to convert quotation to project data." });
        return;
      }

      setToast({
        type: "success",
        title: "Quotation Converted",
        message: `Accepted quotation ${json.data.quotationNumber} converted into project preparation payload cleanly.`,
      });
      setIsDetailsOpen(false);
      fetchQuotations();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error converting quotation." });
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setToast({ type: "success", title: "Quotation Deleted", message: "Quotation removed." });
        fetchQuotations();
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to delete quotation." });
    }
  };

  // Metrics
  const acceptedQuotationsVal = quotations
    .filter((q) => q.status === QuotationStatus.ACCEPTED || q.status === QuotationStatus.CONVERTED)
    .reduce((acc, q) => acc + q.totalAmount, 0);

  const draftCount = quotations.filter((q) => q.status === QuotationStatus.DRAFT).length;
  const sentCount = quotations.filter((q) => q.status === QuotationStatus.SENT || q.status === QuotationStatus.VIEWED).length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Quotations & Proposals</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage custom client proposals with line items, auto-numbering (`QUO-2026-XXXX`), INR ₹ currency, and project conversion.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchQuotations}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedQuotation(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Proposals</span>
          <span className="text-2xl font-black text-slate-900 block">{totalCount}</span>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Drafts</span>
          <span className="text-2xl font-black text-amber-900 block">{draftCount}</span>
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">Sent / Viewed</span>
          <span className="text-2xl font-black text-sky-900 block">{sentCount}</span>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Accepted Value (INR ₹)</span>
          <span className="text-2xl font-black text-emerald-950 block">
            ₹{acceptedQuotationsVal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Statuses", value: "" },
            { label: "Draft", value: QuotationStatus.DRAFT },
            { label: "Sent", value: QuotationStatus.SENT },
            { label: "Viewed", value: QuotationStatus.VIEWED },
            { label: "Accepted", value: QuotationStatus.ACCEPTED },
            { label: "Converted", value: QuotationStatus.CONVERTED },
            { label: "Rejected", value: QuotationStatus.REJECTED },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search quotation number, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* Main Quotation List Table */}
      {isLoading ? (
        <LoadingState />
      ) : errorMsg ? (
        <ErrorState title="Error Loading Quotations" message={errorMsg} onRetry={fetchQuotations} />
      ) : quotations.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Quotations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create custom client quotations with auto-generated sequential numbers, line items, and tax calculations.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedQuotation(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create First Quotation
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Quotation #</th>
                <th className="p-3">Client / Contact</th>
                <th className="p-3">Items</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total Amount (₹)</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <button
                      onClick={() => {
                        setSelectedQuotation(q);
                        setIsDetailsOpen(true);
                      }}
                      className="hover:text-teal-600 text-left underline decoration-slate-300 underline-offset-2"
                    >
                      {q.quotationNumber}
                    </button>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{q.contactName}</div>
                    {q.companyName && (
                      <div className="text-[11px] text-slate-500 flex items-center">
                        <Building className="h-3 w-3 mr-1 text-slate-400" />
                        {q.companyName}
                      </div>
                    )}
                  </td>

                  <td className="p-3 font-medium text-slate-600">
                    {q.items.length} item{q.items.length !== 1 ? "s" : ""}
                  </td>

                  <td className="p-3">
                    <Badge
                      variant={
                        q.status === "ACCEPTED"
                          ? "success"
                          : q.status === "SENT"
                          ? "info"
                          : q.status === "VIEWED"
                          ? "warning"
                          : q.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {q.status}
                    </Badge>
                  </td>

                  <td className="p-3 text-right font-black text-slate-900">
                    ₹{q.totalAmount.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3 text-slate-500 font-medium">
                    {q.validUntil ? formatDate(q.validUntil) : "—"}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {q.status === "ACCEPTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertToProject(q.id)}
                          className="h-7 text-[11px] text-purple-700 border-purple-200 hover:bg-purple-50"
                          title="Convert to Project Data"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Convert
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedQuotation(q);
                          setIsDetailsOpen(true);
                        }}
                        className="h-7 text-xs text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuotation(q.id)}
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Drawer & Details Modals */}
      <QuotationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateQuotation}
        quotation={selectedQuotation}
        leads={leads}
      />

      <QuotationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        quotation={selectedQuotation}
        onStatusChange={handleStatusChange}
        onConvertToProject={handleConvertToProject}
      />
    </div>
  );
}
