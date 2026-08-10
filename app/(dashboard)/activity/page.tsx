"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  Activity,
  ShieldAlert,
  Search,
  Calendar,
  Filter,
  User as UserIcon,
  FileCode,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ActivityLogItem } from "@/types/activity";
import { formatDate } from "@/lib/utils";

export default function GlobalActivityPage() {
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [teamUsers, setTeamUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [selectedUserFilter, setSelectedUserFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");
  const [entityTypeFilter, setEntityTypeFilter] = React.useState("");
  const [startDateFilter, setStartDateFilter] = React.useState("");
  const [endDateFilter, setEndDateFilter] = React.useState("");

  // Metadata Inspector Modal
  const [inspectingLog, setInspectingLog] = React.useState<ActivityLogItem | null>(null);

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

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = `/api/activity?page=${page}&limit=25`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedUserFilter) query += `&userId=${selectedUserFilter}`;
      if (actionFilter) query += `&action=${actionFilter}`;
      if (entityTypeFilter) query += `&entityType=${entityTypeFilter}`;
      if (startDateFilter) query += `&startDate=${startDateFilter}`;
      if (endDateFilter) query += `&endDate=${endDateFilter}`;

      const res = await fetch(query);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data.logs || []);
        setTotalCount(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamUsers = async () => {
    try {
      const res = await fetch("/api/team");
      const json = await res.json();
      if (json.success) {
        setTeamUsers(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchAuthUser();
  }, []);

  React.useEffect(() => {
    if (userRole === "CO_FOUNDER") {
      fetchLogs();
      fetchTeamUsers();
    } else if (userRole === "INTERN") {
      setIsLoading(false);
    }
  }, [userRole, page, search, selectedUserFilter, actionFilter, entityTypeFilter, startDateFilter, endDateFilter]);

  if (userRole === "INTERN") {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            Global Activity and System Audit Trails are restricted exclusively to Co-Founders.
          </p>
        </div>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN")) return <Badge variant="success">USER LOGIN</Badge>;
    if (action.includes("LOGOUT")) return <Badge variant="default">USER LOGOUT</Badge>;
    if (action.includes("CREATE")) return <Badge variant="info">{action}</Badge>;
    if (action.includes("DELETE") || action.includes("REJECT")) return <Badge variant="destructive">{action}</Badge>;
    if (action.includes("ACCEPT") || action.includes("COMPLETE") || action.includes("CONVERT")) return <Badge variant="success">{action}</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Global Activity & Audit Log</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Immutable, append-only system audit trail across logins, projects, financial billing & team actions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          className="h-9 text-xs"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh Feed
        </Button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Total Audit Events</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Log Standard</span>
          <span className="text-sm font-bold text-emerald-600 mt-1 block">APPEND-ONLY IMMUTABLE</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Access Boundaries</span>
          <span className="text-sm font-bold text-indigo-600 mt-1 block">CO-FOUNDER RESTRICTED</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Timezone</span>
          <span className="text-sm font-bold text-slate-700 mt-1 block">Asia/Kolkata (IST)</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>

          <Select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            options={teamUsers.map((u) => ({
              label: `${u.name} (${u.role})`,
              value: u.id,
            }))}
            placeholder="All Users"
            className="w-40 h-8 text-xs"
          />

          <Select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            options={[
              { label: "User", value: "USER" },
              { label: "Lead", value: "LEAD" },
              { label: "Client", value: "CLIENT" },
              { label: "Project", value: "PROJECT" },
              { label: "Task", value: "TASK" },
              { label: "Invoice", value: "INVOICE" },
              { label: "Payment", value: "PAYMENT" },
              { label: "Expense", value: "EXPENSE" },
              { label: "Attendance", value: "ATTENDANCE" },
            ]}
            placeholder="All Entity Types"
            className="w-36 h-8 text-xs"
          />

          <Input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-32 h-8 text-xs"
          />

          <Input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-32 h-8 text-xs"
          />
        </div>

        {(search || selectedUserFilter || actionFilter || entityTypeFilter || startDateFilter || endDateFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedUserFilter("");
              setActionFilter("");
              setEntityTypeFilter("");
              setStartDateFilter("");
              setEndDateFilter("");
            }}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <LoadingState label="Loading system audit log..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description="System actions and audit events will appear here in chronological order."
        />
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4 text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{log.user.name}</span>
                    <span className="text-[10px] text-slate-400">{log.user.email} ({log.user.role})</span>
                  </td>

                  <td className="py-3 px-4">{getActionBadge(log.action)}</td>

                  <td className="py-3 px-4 font-semibold text-slate-700">{log.entityType}</td>

                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                    {log.entityId ? log.entityId.substring(0, 8) + "..." : "—"}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectingLog(log)}
                      className="h-7 text-[11px] text-teal-600 hover:text-teal-700"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View JSON
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON METADATA INSPECTOR MODAL */}
      <Modal isOpen={!!inspectingLog} onClose={() => setInspectingLog(null)} className="max-w-xl">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Audit Log Details & Metadata</h3>
            <p className="text-xs text-slate-500 font-mono">
              ID: {inspectingLog?.id} • Event: {inspectingLog?.action}
            </p>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
            <div>
              <span className="text-slate-500">{"// User:"}</span> {inspectingLog?.user.name} ({inspectingLog?.user.email})
            </div>
            <div>
              <span className="text-slate-500">{"// Timestamp:"}</span> {inspectingLog?.createdAt}
            </div>
            <div>
              <span className="text-slate-500">{"// Entity:"}</span> {inspectingLog?.entityType} (ID: {inspectingLog?.entityId || "N/A"})
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">{"// Metadata Payload:"}</span>
              <pre className="text-emerald-300">
                {JSON.stringify(inspectingLog?.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setInspectingLog(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
