"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ActivityLogItem } from "@/lib/services/activity.service";
import { ActivityAction, EntityType } from "@prisma/client";
import {
  Activity,
  Filter,
  Search,
  Calendar,
  User,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

interface FilterOptionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function ActivityLogView() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [userId, setUserId] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Options state
  const [userOptions, setUserOptions] = useState<FilterOptionUser[]>([]);
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [entityOptions, setEntityOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [userId, action, entityType, startDate, endDate, page]);

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/activity?options=true");
      if (!res.ok) throw new Error("Failed to fetch activity log options");
      const json = await res.json();
      if (json.success) {
        setUserOptions(json.data.users || []);
        setActionOptions(json.data.actions || []);
        setEntityOptions(json.data.entities || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (action) params.set("action", action);
      if (entityType) params.set("entityType", entityType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/activity?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access forbidden. Only Co-Founders can view activity logs.");
        }
        throw new Error("Failed to load activity logs.");
      }

      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        setTotalPages(json.pagination.totalPages || 1);
        setTotalLogs(json.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setUserId("");
    setAction("");
    setEntityType("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

  const getActionBadge = (act: ActivityAction) => {
    switch (act) {
      case "LEAD_CREATED":
      case "CLIENT_CREATED":
      case "PROJECT_CREATED":
      case "TASK_CREATED":
      case "USER_CREATED":
      case "PAYMENT_CREATED":
      case "EXPENSE_CREATED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{act.replace(/_/g, " ")}</Badge>;

      case "LEAD_CONVERTED":
      case "TASK_COMPLETED":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">{act.replace(/_/g, " ")}</Badge>;

      case "TASK_ASSIGNED":
      case "ROLE_CHANGED":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{act.replace(/_/g, " ")}</Badge>;

      default:
        return <Badge variant="outline">{act.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              Activity Log Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8 text-xs text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* User Filter */}
            <Select
              label="User"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Users", value: "" },
                ...userOptions.map((u) => ({ label: `${u.name} (${u.role})`, value: u.id })),
              ]}
            />

            {/* Action Filter */}
            <Select
              label="Action"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Actions", value: "" },
                ...actionOptions.map((a) => ({ label: a.replace(/_/g, " "), value: a })),
              ]}
            />

            {/* Entity Filter */}
            <Select
              label="Entity Type"
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Entities", value: "" },
                ...entityOptions.map((e) => ({ label: e, value: e })),
              ]}
            />

            {/* Start Date */}
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />

            {/* End Date */}
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" className="h-10 px-4">
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ACTIVITY TABLE */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Audit Trail ({totalLogs} events)
            </CardTitle>
            <CardDescription className="text-xs">Immutable system activity records</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading activity logs...</div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-rose-500 font-medium">{error}</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Activity Logs Found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                          {log.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{log.user.name}</p>
                          <span className="text-[10px] text-slate-400">{log.user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
