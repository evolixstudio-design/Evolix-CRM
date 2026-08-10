"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { Plus, CheckSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskFilterBar } from "@/components/tasks/task-filter-bar";
import { TaskListTable } from "@/components/tasks/task-list-table";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskDetailsModal } from "@/components/tasks/task-details-modal";
import { TaskItem } from "@/types/task";
import { TaskStatus } from "@prisma/client";

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // User & Context lists
  const [userRole, setUserRole] = React.useState<string>("CO_FOUNDER");
  const [projects, setProjects] = React.useState<{ id: string; name: string }[]>([]);
  const [clients, setClients] = React.useState<{ id: string; name: string }[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<{ id: string; name: string }[]>([]);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("");
  const [clientFilter, setClientFilter] = React.useState("");
  const [assignedToFilter, setAssignedToFilter] = React.useState("");
  const [myTasksOnly, setMyTasksOnly] = React.useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = React.useState<TaskItem | null>(null);
  const [deleteTargetTask, setDeleteTargetTask] = React.useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchContext = React.useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.data?.role) {
        setUserRole(meJson.data.role);
        if (meJson.data.role === "INTERN") {
          setMyTasksOnly(true);
        }
      }

      const projectsRes = await fetch("/api/projects?limit=100");
      const projectsJson = await projectsRes.json();
      if (projectsJson.success && projectsJson.data?.projects) {
        setProjects(projectsJson.data.projects.map((p: any) => ({ id: p.id, name: p.name })));
      }

      const clientsRes = await fetch("/api/clients?limit=100");
      const clientsJson = await clientsRes.json();
      if (clientsJson.success && clientsJson.data?.clients) {
        setClients(clientsJson.data.clients.map((c: any) => ({ id: c.id, name: c.name })));
      }

      const dashRes = await fetch("/api/dashboard");
      const dashJson = await dashRes.json();
      if (dashJson.success && dashJson.data?.teamWorkload) {
        setTeamMembers(
          dashJson.data.teamWorkload.map((m: any) => ({ id: m.userId, name: m.name }))
        );
      }
    } catch (e) {
      console.error("Failed context fetch:", e);
    }
  }, []);

  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (projectFilter) params.set("projectId", projectFilter);
      if (clientFilter) params.set("clientId", clientFilter);
      if (assignedToFilter) params.set("assignedToId", assignedToFilter);
      if (myTasksOnly) params.set("myTasksOnly", "true");

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to fetch tasks.");
        setIsLoading(false);
        return;
      }

      setTasks(json.data.tasks);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setErrorMsg("Network error fetching tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, projectFilter, clientFilter, assignedToFilter, myTasksOnly]);

  React.useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setProjectFilter("");
    setClientFilter("");
    setAssignedToFilter("");
    setMyTasksOnly(userRole === "INTERN");
    setPage(1);
  };

  const handleCreateOpen = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (task: TaskItem) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleViewDetails = async (task: TaskItem) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSelectedTaskDetails(json.data);
        setIsDetailsOpen(true);
      } else {
        setToast({ type: "error", title: "Access Error", message: json.error?.message || "Task details restricted." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to load task details." });
    } fontFinally: {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingTask);
      const url = isEditing ? `/api/tasks/${editingTask!.id}` : "/api/tasks";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Save Failed",
          message: json.error?.message || "Failed to save task.",
        });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Task Updated" : "Task Created",
        message: `Successfully saved task '${json.data.title}'`,
      });
      setIsFormOpen(false);
      fetchTasks();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving task." });
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
        setSelectedTaskDetails(json.data);
        fetchTasks();
        setToast({ type: "success", title: "Status Updated", message: `Task status changed to ${newStatus.replace("_", " ")}` });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to update task status." });
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Accept Failed", message: json.error?.message || "Failed to accept task." });
        return;
      }
      setToast({ type: "success", title: "Task Accepted", message: "Task assignment accepted successfully." });
      if (selectedTaskDetails?.id === taskId) {
        setSelectedTaskDetails(json.data);
      }
      await fetchTasks();
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
      if (selectedTaskDetails?.id === taskId) {
        setSelectedTaskDetails(json.data);
      }
      await fetchTasks();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error declining task." });
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedTaskDetails(json.data);
        setToast({ type: "success", title: "Comment Posted", message: "Successfully added comment to task." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to post comment." });
    }
  };

  const handleAddAttachment = async (taskId: string, fileData: any) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedTaskDetails(json.data);
        setToast({ type: "success", title: "Attachment Uploaded", message: "Successfully uploaded file attachment." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to upload attachment." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetTask) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${deleteTargetTask.id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Delete Failed", message: json.error?.message || "Failed to delete task." });
        return;
      }

      setToast({ type: "success", title: "Task Deleted", message: `Task '${deleteTargetTask.title}' removed.` });
      setDeleteTargetTask(null);
      fetchTasks();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error deleting task." });
    } finally {
      setIsDeleting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage team tasks, assignments, status transitions, and deliverable reviews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => fetchTasks()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          {userRole === "CO_FOUNDER" && (
            <Button variant="primary" size="sm" onClick={handleCreateOpen}>
              <Plus className="h-4 w-4 mr-1.5" />
              + Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <TaskFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        projectId={projectFilter}
        onProjectChange={setProjectFilter}
        assignedToId={assignedToFilter}
        onAssignedToChange={setAssignedToFilter}
        myTasksOnly={myTasksOnly}
        onMyTasksToggle={setMyTasksOnly}
        onResetFilters={handleResetFilters}
        projects={projects}
        teamMembers={teamMembers}
        userRole={userRole}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState />
      ) : errorMsg ? (
        <ErrorState title="Failed to Load Tasks" message={errorMsg} onRetry={fetchTasks} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description="No task deliverables match the selected filters."
          actionLabel={userRole === "CO_FOUNDER" ? "+ Create First Task" : undefined}
          onAction={userRole === "CO_FOUNDER" ? handleCreateOpen : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <TaskListTable
            tasks={tasks}
            userRole={userRole}
            onViewDetails={handleViewDetails}
            onEditTask={handleEditOpen}
            onDeleteTask={(t) => setDeleteTargetTask(t)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 text-xs">
              <span className="text-slate-500 font-medium">
                Showing Page {page} of {totalPages} ({total} total tasks)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Form Drawer (Create / Edit) */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
        projects={projects}
        clients={clients}
        teamMembers={teamMembers}
        userRole={userRole}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        task={selectedTaskDetails}
        userRole={userRole}
        onStatusChange={handleStatusChange}
        onAcceptTask={handleAcceptTask}
        onDeclineTask={handleDeclineTask}
        onAddComment={handleAddComment}
        onAddAttachment={handleAddAttachment}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetTask)}
        onClose={() => setDeleteTargetTask(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task?"
        description={`Are you sure you want to delete task '${deleteTargetTask?.title}'? This action cannot be undone.`}
        confirmLabel="Delete Task"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
