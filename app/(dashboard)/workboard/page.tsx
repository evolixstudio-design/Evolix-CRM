"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  ShieldAlert,
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Filter,
  RefreshCw,
  Layers,
  Building,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { TaskDetailsModal } from "@/components/tasks/task-details-modal";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export default function WorkboardPage() {
  const [userRole, setUserRole] = React.useState<string>("CO_FOUNDER");
  const [currentUserId, setCurrentUserId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isForbidden, setIsForbidden] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Workboard Data
  const [workboardData, setWorkboardData] = React.useState<any>(null);

  // Filters
  const [selectedLeaderId, setSelectedLeaderId] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [dueDateFilter, setDueDateFilter] = React.useState("");

  // Details Modal
  const [selectedTaskDetails, setSelectedTaskDetails] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const fetchWorkboard = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsForbidden(false);

    try {
      // 1. Verify User Role
      const meRes = await fetch("/api/auth/me");
      if (meRes.status === 401) {
        window.location.href = "/login";
        return;
      }
      const meJson = await meRes.json();
      if (meJson.success && meJson.data) {
        setUserRole(meJson.data.role);
        setCurrentUserId(meJson.data.id);
        if (meJson.data.role === "INTERN") {
          setIsForbidden(true);
          setIsLoading(false);
          return;
        }
      }

      // 2. Fetch Workboard dataset
      const params = new URLSearchParams();
      if (selectedLeaderId) params.set("leaderId", selectedLeaderId);
      if (projectFilter) params.set("projectId", projectFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (dueDateFilter) params.set("dueDate", dueDateFilter);

      const res = await fetch(`/api/workboard?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();

      if (res.status === 403 || !res.ok) {
        if (res.status === 403) {
          setIsForbidden(true);
        } else {
          setErrorMsg(json.error?.message || "Failed to load Team Leader Workboard.");
        }
        setIsLoading(false);
        return;
      }

      setWorkboardData(json.data);
    } catch (e) {
      setErrorMsg("Network error fetching Team Leader Workboard.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedLeaderId, projectFilter, statusFilter, priorityFilter, dueDateFilter]);

  React.useEffect(() => {
    fetchWorkboard();
  }, [fetchWorkboard]);

  const handleResetFilters = () => {
    setSelectedLeaderId("");
    setProjectFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setDueDateFilter("");
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Accept Failed", message: json.error?.message || "Failed to accept task." });
        return;
      }
      setToast({ type: "success", title: "Task Accepted", message: "Task assignment accepted successfully." });
      fetchWorkboard();
      if (selectedTaskDetails?.id === taskId) {
        setSelectedTaskDetails(json.data);
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error accepting task." });
    }
  };

  const handleDeclineTask = async (taskId: string, declineReason: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declineReason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Decline Failed", message: json.error?.message || "Failed to decline task." });
        return;
      }
      setToast({ type: "success", title: "Task Declined", message: "Task assignment declined." });
      fetchWorkboard();
      if (selectedTaskDetails?.id === taskId) {
        setSelectedTaskDetails(json.data);
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error declining task." });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setToast({ type: "success", title: "Status Updated", message: `Task status changed to ${newStatus.replace("_", " ")}` });
        fetchWorkboard();
        if (selectedTaskDetails?.id === taskId) {
          setSelectedTaskDetails(json.data);
        }
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to update task status." });
    }
  };

  const handleViewTaskDetails = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedTaskDetails(json.data);
        setIsDetailsOpen(true);
      }
    } catch (e) {
      console.error("Failed to load task details:", e);
    }
  };

  // 403 Forbidden Component for Intern Rejection
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
              The Team Leader Workboard is reserved strictly for Co-Founders. Intern accounts are not authorized to view operational workboards.
            </p>
          </div>
          <Badge variant="destructive" className="px-3 py-1 text-xs">
            Role: {userRole} (Access Denied)
          </Badge>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (errorMsg || !workboardData) {
    return <ErrorState title="Failed to Load Workboard" message={errorMsg || "No workboard data found."} onRetry={fetchWorkboard} />;
  }

  const { summary, projects, tasks, leadersWorkload, selectedLeader } = workboardData;

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Team Leader Workboard</h1>
            <Badge variant="outline" className="text-xs font-semibold border-teal-200 text-teal-800 bg-teal-50">
              Co-Founder Only
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Dedicated operational workboard for Team Leaders ({selectedLeader.name} &bull; {selectedLeader.domain}).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchWorkboard}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Leader Domain Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {leadersWorkload.map((leader: any) => {
          const isSelected = leader.userId === selectedLeader.id;
          return (
            <button
              key={leader.userId}
              type="button"
              onClick={() => setSelectedLeaderId(leader.userId)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-teal-500"
                  : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{leader.name}</span>
                <Badge
                  variant={isSelected ? "secondary" : "outline"}
                  className="text-[10px] uppercase font-bold"
                >
                  {leader.assignedTasksCount} Tasks
                </Badge>
              </div>
              <p className={`text-xs mt-1 truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                {leader.domain}
              </p>

              <div className="flex items-center space-x-3 mt-3 text-[11px]">
                <span className={isSelected ? "text-amber-300" : "text-amber-600 font-semibold"}>
                  {leader.pendingAcceptanceCount} Pending
                </span>
                <span className={isSelected ? "text-teal-300" : "text-teal-600 font-semibold"}>
                  {leader.inProgressCount} Active
                </span>
                {leader.overdueCount > 0 && (
                  <span className={isSelected ? "text-rose-300 font-bold" : "text-rose-600 font-bold"}>
                    {leader.overdueCount} Overdue
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Operational Metric Cards (8 Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">My Projects</span>
          <span className="text-xl font-black text-slate-900 block">{summary.myProjectsCount}</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">My Tasks</span>
          <span className="text-xl font-black text-slate-900 block">{summary.myTasksCount}</span>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending</span>
          <span className="text-xl font-black text-amber-900 block">{summary.pendingAcceptanceCount}</span>
        </div>

        <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">In Progress</span>
          <span className="text-xl font-black text-sky-900 block">{summary.inProgressCount}</span>
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Submitted</span>
          <span className="text-xl font-black text-indigo-900 block">{summary.submittedCount}</span>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Completed</span>
          <span className="text-xl font-black text-emerald-900 block">{summary.completedCount}</span>
        </div>

        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Overdue</span>
          <span className="text-xl font-black text-rose-900 block">{summary.overdueCount}</span>
        </div>

        <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">Avg Progress</span>
          <span className="text-xl font-black text-teal-900 block">{summary.avgProgressPercentage}%</span>
        </div>
      </div>

      {/* Operational Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-1 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span>Filters:</span>
        </div>

        <div className="w-44">
          <Select
            placeholder="All Projects"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { label: "All Projects", value: "" },
              ...projects.map((p: any) => ({ label: p.name, value: p.id })),
            ]}
          />
        </div>

        <div className="w-36">
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "" },
              { label: "Assigned", value: TaskStatus.ASSIGNED },
              { label: "Accepted", value: TaskStatus.ACCEPTED },
              { label: "Declined", value: TaskStatus.DECLINED },
              { label: "In Progress", value: TaskStatus.IN_PROGRESS },
              { label: "Submitted", value: TaskStatus.SUBMITTED },
              { label: "Completed", value: TaskStatus.COMPLETED },
            ]}
          />
        </div>

        <div className="w-32">
          <Select
            placeholder="All Priorities"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { label: "All Priorities", value: "" },
              { label: "Low", value: TaskPriority.LOW },
              { label: "Medium", value: TaskPriority.MEDIUM },
              { label: "High", value: TaskPriority.HIGH },
              { label: "Urgent", value: TaskPriority.URGENT },
            ]}
          />
        </div>

        <div className="w-36">
          <Input
            type="date"
            placeholder="Due Date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="h-8 text-xs bg-white"
          />
        </div>

        {(projectFilter || statusFilter || priorityFilter || dueDateFilter || selectedLeaderId) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs h-8">
            Reset
          </Button>
        )}
      </div>

      {/* Main Grid: Operational Projects & Task Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects Progress & Phases (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <FolderKanban className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Leader Projects ({projects.length})
            </h3>
          </div>

          {projects.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
              No active projects assigned to this leader.
            </div>
          ) : (
            projects.map((p: any) => (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                    <span className="text-[11px] text-slate-500 flex items-center mt-0.5">
                      <Building className="h-3 w-3 mr-1 text-slate-400" />
                      {p.client.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {p.status}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="text-teal-700">{p.overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300"
                      style={{ width: `${p.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Phase Breakdown */}
                {p.phases && p.phases.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phases Breakdown ({p.phases.length})
                    </span>
                    <div className="space-y-1">
                      {p.phases.map((ph: any) => (
                        <div key={ph.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded">
                          <span className="font-medium text-slate-700">{ph.name}</span>
                          <span className="font-bold text-teal-700">{ph.progress}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Operational Task Deliverables (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Task Deliverables ({tasks.length})
              </h3>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
              No tasks deliverables match the current filter criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((t: any) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 bg-white ${
                    t.status === "ASSIGNED"
                      ? "border-amber-200 bg-amber-50/20"
                      : t.status === "DECLINED"
                      ? "border-rose-200 bg-rose-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTaskDetails(t.id)}
                          className="font-bold text-sm text-slate-900 hover:text-teal-600 text-left"
                        >
                          {t.title}
                        </button>
                        <Badge
                          variant={
                            t.status === "ASSIGNED"
                              ? "warning"
                              : t.status === "ACCEPTED"
                              ? "info"
                              : t.status === "DECLINED"
                              ? "destructive"
                              : t.status === "COMPLETED"
                              ? "success"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {t.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        Client: {t.client.name} &bull; Project: {t.project.name}
                        {t.phase && ` &bull; Phase: ${t.phase.name}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Accept / Decline Quick Actions */}
                      {t.status === "ASSIGNED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const r = prompt("Reason for declining task:");
                              if (r) handleDeclineTask(t.id, r);
                            }}
                            className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptTask(t.id)}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTaskDetails(t.id)}
                        className="h-7 text-xs"
                      >
                        Details &rarr;
                      </Button>
                    </div>
                  </div>

                  {t.declineReason && (
                    <div className="text-xs p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                      <strong>Decline Reason:</strong> {t.declineReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-medium">
                    <span>Priority: {t.priority}</span>
                    <span>Due: {t.dueDate ? formatDate(t.dueDate) : "No Due Date"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal Integration */}
      <TaskDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        task={selectedTaskDetails}
        userRole={userRole}
        onStatusChange={handleStatusChange}
        onAcceptTask={handleAcceptTask}
        onDeclineTask={handleDeclineTask}
        onAddComment={async (taskId, content) => {
          await fetch(`/api/tasks/${taskId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
          handleViewTaskDetails(taskId);
        }}
      />
    </div>
  );
}
