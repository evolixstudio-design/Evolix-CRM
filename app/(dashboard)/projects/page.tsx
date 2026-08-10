"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { Plus, FolderKanban, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { ProjectFilterBar } from "@/components/projects/project-filter-bar";
import { ProjectListTable } from "@/components/projects/project-list-table";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { ProjectDetailsModal } from "@/components/projects/project-details-modal";
import { ProjectItem } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // User role & context lists
  const [userRole, setUserRole] = React.useState<string>("CO_FOUNDER");
  const [clients, setClients] = React.useState<{ id: string; name: string }[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<{ id: string; name: string }[]>([]);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = React.useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<ProjectItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = React.useState<ProjectItem | null>(null);

  const fetchUserContextAndClients = React.useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.data?.role) {
        setUserRole(meJson.data.role);
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
      console.error("Failed user context fetch:", e);
    }
  }, []);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (serviceTypeFilter) params.set("serviceType", serviceTypeFilter);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to fetch projects.");
        setIsLoading(false);
        return;
      }

      setProjects(json.data.projects);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setErrorMsg("Network error fetching projects.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, serviceTypeFilter]);

  React.useEffect(() => {
    fetchUserContextAndClients();
  }, [fetchUserContextAndClients]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setServiceTypeFilter("");
    setPage(1);
  };

  const handleCreateOpen = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (project: ProjectItem) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleViewDetails = async (project: ProjectItem) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSelectedProjectDetails(json.data);
        setIsDetailsOpen(true);
      } else {
        setToast({ type: "error", title: "Access Error", message: json.error?.message || "Project details restricted." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to load project details." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingProject);
      const url = isEditing ? `/api/projects/${editingProject!.id}` : "/api/projects";
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
          message: json.error?.message || "Failed to save project.",
        });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Project Updated" : "Project Created",
        message: `Successfully saved ${json.data.name}`,
      });
      setIsFormOpen(false);
      fetchProjects();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving project." });
    }
  };

  const handleAddMember = async (projectId: string, memberUserId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberUserId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to add member." });
        return;
      }

      setSelectedProjectDetails(json.data);
      setToast({ type: "success", title: "Member Added", message: "Successfully assigned team member to project." });
      fetchProjects();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to add team member." });
    }
  };

  const handleRemoveMember = async (projectId: string, memberUserId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${memberUserId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to remove member." });
        return;
      }

      setSelectedProjectDetails(json.data);
      setToast({ type: "success", title: "Member Removed", message: "Successfully removed member from project." });
      fetchProjects();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to remove team member." });
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <Badge variant={userRole === "CO_FOUNDER" ? "default" : "info"}>
              {userRole === "CO_FOUNDER" ? "All Projects" : "Assigned Projects"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track client deliverables, team member assignments, deadlines, and task completion.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchProjects} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {userRole === "CO_FOUNDER" && (
            <Button variant="primary" size="sm" onClick={handleCreateOpen}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Project
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <ProjectFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        serviceType={serviceTypeFilter}
        onServiceTypeChange={setServiceTypeFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table / States */}
      {errorMsg ? (
        <ErrorState title="Error Loading Projects" message={errorMsg} onRetry={fetchProjects} />
      ) : isLoading ? (
        <LoadingState label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description={
            search || statusFilter || priorityFilter || serviceTypeFilter
              ? "No projects match your active search filters."
              : userRole === "INTERN"
              ? "You are not assigned to any projects at the moment."
              : "No projects exist in the system yet. Click 'Add Project' to create your first project."
          }
          actionLabel={search || statusFilter ? "Reset Filters" : userRole === "CO_FOUNDER" ? "Add Project" : undefined}
          onAction={search || statusFilter ? handleResetFilters : handleCreateOpen}
          icon={<FolderKanban className="h-6 w-6" />}
        />
      ) : (
        <Card className="p-0 border-slate-100 overflow-hidden">
          <ProjectListTable
            projects={projects}
            userRole={userRole}
            onViewDetails={handleViewDetails}
            onEditProject={handleEditOpen}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 text-xs">
              <span className="text-slate-500 font-medium">
                Showing Page {page} of {totalPages} ({total} total projects)
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
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        project={editingProject}
        clients={clients}
        teamMembers={teamMembers}
        userRole={userRole}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        project={selectedProjectDetails}
        allTeamMembers={teamMembers}
        userRole={userRole}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onRefreshProject={async () => {
          if (selectedProjectDetails) {
            await handleViewDetails(selectedProjectDetails);
          }
          await fetchProjects();
        }}
      />
    </div>
  );
}
