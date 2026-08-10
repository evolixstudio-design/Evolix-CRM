"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientFilterBar } from "@/components/clients/client-filter-bar";
import { ClientListTable } from "@/components/clients/client-list-table";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { ClientProfileModal } from "@/components/clients/client-profile-modal";
import { ClientItem } from "@/types/client";

export default function ClientsPage() {
  const [clients, setClients] = React.useState<ClientItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // User role context
  const [userRole, setUserRole] = React.useState<string>("CO_FOUNDER");

  // Filters state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  // Team members list
  const [coFounders, setCoFounders] = React.useState<{ id: string; name: string }[]>([]);
  const [interns, setInterns] = React.useState<{ id: string; name: string }[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<ClientItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = React.useState<ClientItem | null>(null);
  const [deletingClient, setDeletingClient] = React.useState<ClientItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchUserRoleAndTeam = React.useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.data?.role) {
        setUserRole(meJson.data.role);
      }

      const teamRes = await fetch("/api/team");
      const teamJson = await teamRes.json();
      if (teamJson.success && Array.isArray(teamJson.data)) {
        setCoFounders(
          teamJson.data
            .filter((m: any) => m.role === "CO_FOUNDER")
            .map((m: any) => ({ id: m.id, name: m.name }))
        );
        setInterns(
          teamJson.data
            .filter((m: any) => m.role === "INTERN")
            .map((m: any) => ({ id: m.id, name: m.name }))
        );
      }
    } catch (e) {
      console.error("Failed user context fetch:", e);
    }
  }, []);

  const fetchClients = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/clients?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to fetch clients.");
        setIsLoading(false);
        return;
      }

      setClients(json.data.clients);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setErrorMsg("Network error fetching clients.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  React.useEffect(() => {
    fetchUserRoleAndTeam();
  }, [fetchUserRoleAndTeam]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  };

  const handleCreateOpen = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (client: ClientItem) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleViewProfile = async (client: ClientItem) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSelectedClientProfile(json.data);
        setIsProfileOpen(true);
      } else {
        setToast({ type: "error", title: "Access Error", message: json.error?.message || "Client profile restricted." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to load client profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingClient);
      const url = isEditing ? `/api/clients/${editingClient!.id}` : "/api/clients";
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
          message: json.error?.message || "Failed to save client.",
        });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Client Updated" : "Client Created",
        message: `Successfully saved ${json.data.name}`,
      });
      setIsFormOpen(false);
      fetchClients();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving client." });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deletingClient.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Delete Failed",
          message: json.error?.message || "Failed to delete client account.",
        });
        return;
      }
      setToast({
        type: "success",
        title: "Client Deleted",
        message: `Successfully removed client account ${deletingClient.name}.`,
      });
      setDeletingClient(null);
      fetchClients();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error deleting client." });
    } finally {
      setIsDeleting(false);
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
            <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
            <Badge variant={userRole === "CO_FOUNDER" ? "default" : "info"}>
              {userRole === "CO_FOUNDER" ? "All Accounts" : "Assigned Accounts"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Client directory, contact details, account managers, and associated projects.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchClients} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {userRole === "CO_FOUNDER" && (
            <Button variant="primary" size="sm" onClick={handleCreateOpen}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Client
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <ClientFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table / States */}
      {errorMsg ? (
        <ErrorState title="Error Loading Clients" message={errorMsg} onRetry={fetchClients} />
      ) : isLoading ? (
        <LoadingState label="Loading clients directory..." />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No Clients Found"
          description={
            search || statusFilter
              ? "No clients match your active search filters."
              : userRole === "INTERN"
              ? "You do not have any assigned clients at the moment."
              : "No clients exist in the system yet. Click 'Add Client' to create your first account."
          }
          actionLabel={search || statusFilter ? "Reset Filters" : userRole === "CO_FOUNDER" ? "Add Client" : undefined}
          onAction={search || statusFilter ? handleResetFilters : handleCreateOpen}
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <Card className="p-0 border-slate-100 overflow-hidden">
          <ClientListTable
            clients={clients}
            userRole={userRole}
            onViewProfile={handleViewProfile}
            onEditClient={handleEditOpen}
            onDeleteClient={setDeletingClient}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 text-xs">
              <span className="text-slate-500 font-medium">
                Showing Page {page} of {totalPages} ({total} total clients)
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
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        client={editingClient}
        coFounders={coFounders}
        interns={interns}
        userRole={userRole}
      />

      {/* Client Profile Modal */}
      <ClientProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        client={selectedClientProfile}
        userRole={userRole}
      />

      {/* Confirm Client Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingClient)}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client Account"
        description={`Are you sure you want to permanently delete '${deletingClient?.name}'? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Account"}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
