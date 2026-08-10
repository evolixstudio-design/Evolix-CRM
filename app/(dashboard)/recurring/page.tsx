"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  Zap,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { RecurringContractItem } from "@/types/recurring";
import { formatDate } from "@/lib/utils";
import { RecurringDealFormModal } from "@/components/recurring/recurring-deal-form-modal";
import { RecurringDetailsModal } from "@/components/recurring/recurring-details-modal";

export default function RecurringPage() {
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [contracts, setContracts] = React.useState<RecurringContractItem[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<RecurringContractItem | null>(null);
  const [reminders, setReminders] = React.useState<any>(null);

  const fetchAuthUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setUserRole(json.data.role);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contractsRes, clientsRes, projectsRes, remindersRes] = await Promise.all([
        fetch(`/api/recurring?search=${encodeURIComponent(search)}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`),
        fetch("/api/clients?limit=100"),
        fetch("/api/projects?limit=100"),
        fetch("/api/recurring/reminders"),
      ]);

      if (contractsRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const [cJson, clJson, prJson, remJson] = await Promise.all([
        contractsRes.json(),
        clientsRes.json(),
        projectsRes.json(),
        remindersRes.json(),
      ]);

      if (cJson.success) setContracts(cJson.data.contracts || []);
      if (clJson.success) setClients(clJson.data.clients || []);
      if (prJson.success) setProjects(prJson.data.projects || []);
      if (remJson.success) setReminders(remJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuthUser();
  }, []);

  React.useEffect(() => {
    if (userRole === "CO_FOUNDER") {
      fetchData();
    } else if (userRole === "INTERN") {
      setIsLoading(false);
    }
  }, [userRole, search, statusFilter]);

  if (userRole === "INTERN") {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            Financial contracts and recurring brand deals are restricted to Co-Founders.
          </p>
        </div>
      </div>
    );
  }

  const activeDeals = contracts.filter((c) => c.status === "ACTIVE");
  const totalMonthlyVal = activeDeals.reduce((sum, c) => sum + c.monthlyAmount, 0);
  const totalInvoicesGen = contracts.reduce((sum, c) => sum + c.generatedInvoicesCount, 0);
  const overdueCount = reminders?.summary?.overdueCount || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Recurring Brand Deals</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage long-term brand retainers & automated billing schedules
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          + New Brand Deal
        </Button>
      </div>

      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Active Deals</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{activeDeals.length}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Monthly Retainer Revenue</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              ₹{totalMonthlyVal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Generated Invoices</span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">{totalInvoicesGen}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Overdue Periods</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{overdueCount}</span>
          </div>
        </div>

        {/* Reminders Alert Banner */}
        {reminders && (reminders.summary?.dueTodayCount > 0 || reminders.summary?.overdueCount > 0) && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center space-x-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Billing Schedule Reminders</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {reminders.summary?.dueTodayCount > 0 && (
                <span className="font-semibold text-amber-800">
                  🔔 {reminders.summary.dueTodayCount} period(s) DUE TODAY!
                </span>
              )}
              {reminders.summary?.overdueCount > 0 && (
                <span className="font-semibold text-rose-700">
                  ⚠️ {reminders.summary.overdueCount} period(s) OVERDUE!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold text-slate-600">
            {["ALL", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === st ? "bg-white text-slate-900 shadow-sm font-bold" : "hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search deal or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <LoadingState label="Loading recurring brand deals..." />
        ) : contracts.length === 0 ? (
          <EmptyState
            title="No Recurring Brand Deals Found"
            description="Create your first 12-month brand deal retainer to automate monthly schedule invoices."
            actionLabel="+ Create Brand Deal"
            onAction={() => setIsFormOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Client / Project</th>
                  <th className="py-3 px-4">Monthly Rate</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Invoices</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.title}</span>
                      <span className="text-[10px] text-slate-400">
                        Start: {formatDate(c.startDate)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{c.client.name}</span>
                      {c.project && <span className="text-[10px] text-slate-400">Proj: {c.project.name}</span>}
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{c.monthlyAmount.toLocaleString("en-IN")}/mo
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.durationMonths} Months
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="info">
                        {c.generatedInvoicesCount} / {c.durationMonths} Invoices
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={c.status === "ACTIVE" ? "success" : "default"}>
                        {c.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(c)}
                        className="h-7 text-[11px]"
                      >
                        View Schedule
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form & Details Modals */}
      <RecurringDealFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchData}
        clients={clients}
        projects={projects}
      />

      <RecurringDetailsModal
        isOpen={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        contract={selectedContract}
        onRefresh={fetchData}
      />
    </div>
  );
}
