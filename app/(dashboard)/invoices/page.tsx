"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building,
  FolderKanban,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { InvoiceFormModal } from "@/components/invoices/invoice-form-modal";
import { InvoiceDetailsModal } from "@/components/invoices/invoice-details-modal";
import { InvoiceItem, InvoiceStatus } from "@/types/invoice";
import { formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [userRole, setUserRole] = React.useState<string>("CO_FOUNDER");
  const [isForbidden, setIsForbidden] = React.useState(false);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  // Modals
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsForbidden(false);

    try {
      // 1. Verify Role
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.data) {
        setUserRole(meJson.data.role);
        if (meJson.data.role === "INTERN") {
          setIsForbidden(true);
          setIsLoading(false);
          return;
        }
      }

      // 2. Fetch Invoices dataset
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json = await res.json();

      if (res.status === 403 || !res.ok) {
        if (res.status === 403) {
          setIsForbidden(true);
        } else {
          setErrorMsg(json.error?.message || "Failed to fetch invoices.");
        }
        setIsLoading(false);
        return;
      }

      setInvoices(json.data.invoices || []);
      setTotalCount(json.data.total || 0);
    } catch (e) {
      setErrorMsg("Network error fetching invoices.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchProjectsAndClients = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        fetch("/api/projects?limit=100"),
        fetch("/api/clients?limit=100"),
      ]);

      const [projJson, clientJson] = await Promise.all([projRes.json(), clientRes.json()]);

      if (projRes.ok && projJson.success) {
        setProjects(projJson.data.projects || []);
      }
      if (clientRes.ok && clientJson.success) {
        setClients(clientJson.data.clients || []);
      }
    } catch (e) {
      console.error("Failed to load options for invoice form", e);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  React.useEffect(() => {
    fetchProjectsAndClients();
  }, []);

  const handleCreateInvoice = async (formData: any) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Create Failed", message: json.error?.message || "Failed to create invoice." });
        return;
      }

      setToast({ type: "success", title: "Invoice Generated", message: `Invoice #${json.data.invoiceNumber} created successfully.` });
      setIsFormOpen(false);
      fetchInvoices();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error creating invoice." });
    }
  };

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setToast({ type: "success", title: "Status Updated", message: `Invoice status updated to ${newStatus}` });
        fetchInvoices();
        if (selectedInvoice?.id === id) {
          setSelectedInvoice(json.data);
        }
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to update invoice status." });
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setToast({ type: "success", title: "Invoice Deleted", message: "Invoice removed successfully." });
        fetchInvoices();
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to delete invoice." });
    }
  };

  // 403 Forbidden Rejection for Interns
  if (isForbidden) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">HTTP 403 — Access Forbidden</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              Invoice management and financial monetary values are strictly restricted to Co-Founders. Intern accounts are not authorized to access invoice data.
            </p>
          </div>
          <Badge variant="destructive" className="px-3 py-1 text-xs">
            Role: {userRole} (Financial Access Denied)
          </Badge>
        </div>
      </div>
    );
  }

  // Metrics
  const paidVal = invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((acc, i) => acc + i.totalAmount, 0);
  const pendingVal = invoices
    .filter((i) => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.PARTIALLY_PAID || i.status === InvoiceStatus.OVERDUE)
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const draftCount = invoices.filter((i) => i.status === InvoiceStatus.DRAFT).length;

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
            <CreditCard className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Invoice Management</h1>
            <Badge variant="outline" className="text-xs font-semibold border-teal-200 text-teal-800 bg-teal-50">
              Co-Founder Only
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Generate and track client invoices (`INV-2026-XXXX`), linked to Projects & Clients with INR ₹ monetary values.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchInvoices}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedInvoice(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Invoices</span>
          <span className="text-2xl font-black text-slate-900 block">{totalCount}</span>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Draft Invoices</span>
          <span className="text-2xl font-black text-amber-900 block">{draftCount}</span>
        </div>

        <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">Pending Amount (₹)</span>
          <span className="text-2xl font-black text-sky-950 block">
            ₹{pendingVal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Paid Amount (₹)</span>
          <span className="text-2xl font-black text-emerald-950 block">
            ₹{paidVal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Statuses", value: "" },
            { label: "Draft", value: InvoiceStatus.DRAFT },
            { label: "Sent", value: InvoiceStatus.SENT },
            { label: "Partially Paid", value: InvoiceStatus.PARTIALLY_PAID },
            { label: "Paid", value: InvoiceStatus.PAID },
            { label: "Overdue", value: InvoiceStatus.OVERDUE },
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
            placeholder="Search invoice number, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      {isLoading ? (
        <LoadingState />
      ) : errorMsg ? (
        <ErrorState title="Error Loading Invoices" message={errorMsg} onRetry={fetchInvoices} />
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Invoices Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate client invoices originating from Projects with line items, tax calculations, and payment tracking.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedInvoice(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Generate First Invoice
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Billed Client</th>
                <th className="p-3">Project</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total Amount (₹)</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsDetailsOpen(true);
                      }}
                      className="hover:text-teal-600 text-left underline decoration-slate-300 underline-offset-2"
                    >
                      {inv.invoiceNumber}
                    </button>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{inv.client.name}</div>
                    {inv.client.companyName && (
                      <div className="text-[11px] text-slate-500 flex items-center">
                        <Building className="h-3 w-3 mr-1 text-slate-400" />
                        {inv.client.companyName}
                      </div>
                    )}
                  </td>

                  <td className="p-3 font-medium text-slate-700">
                    {inv.project ? (
                      <span className="flex items-center text-teal-700 font-semibold">
                        <FolderKanban className="h-3.5 w-3.5 mr-1" />
                        {inv.project.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Direct Billing</span>
                    )}
                  </td>

                  <td className="p-3">
                    <Badge
                      variant={
                        inv.status === "PAID"
                          ? "success"
                          : inv.status === "SENT"
                          ? "info"
                          : inv.status === "PARTIALLY_PAID"
                          ? "warning"
                          : inv.status === "OVERDUE"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {inv.status}
                    </Badge>
                  </td>

                  <td className="p-3 text-right font-black text-slate-900">
                    ₹{inv.totalAmount.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3 text-slate-500 font-medium">
                    {inv.dueDate ? formatDate(inv.dueDate) : "On Receipt"}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsDetailsOpen(true);
                        }}
                        className="h-7 text-xs text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvoice(inv.id)}
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
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateInvoice}
        invoice={selectedInvoice}
        projects={projects}
        clients={clients}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        invoice={selectedInvoice}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
