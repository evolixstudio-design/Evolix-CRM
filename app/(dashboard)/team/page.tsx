"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { UserPlus, ShieldAlert, Users, Briefcase, CheckSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
import { TeamListTable } from "@/components/team/team-list-table";
import { InternFormModal } from "@/components/team/intern-form-modal";
import { TeamMemberDetailsModal } from "@/components/team/team-member-details-modal";
import { UserEditModal } from "@/components/team/user-edit-modal";
import { TeamMemberItem } from "@/types/team";

export default function TeamPage() {
  const [members, setMembers] = React.useState<TeamMemberItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedMemberDetails, setSelectedMemberDetails] = React.useState<TeamMemberItem | null>(null);

  const [editingMember, setEditingMember] = React.useState<TeamMemberItem | null>(null);

  const fetchTeamMembers = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/team");
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 403) {
          setErrorMsg("Access Denied: User Management is restricted exclusively to Co-Founders.");
        } else {
          setErrorMsg(json.error?.message || "Failed to fetch team members.");
        }
        setIsLoading(false);
        return;
      }

      setMembers(json.data);
    } catch (e) {
      setErrorMsg("Network error fetching user directory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleCreateInternSubmit = async (formData: any) => {
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Account Creation Failed",
          message: json.error?.message || "Failed to create user account.",
        });
        return;
      }

      setToast({
        type: "success",
        title: "Account Created!",
        message: `Successfully registered account for ${json.data.name} (${json.data.email}).`,
      });
      setIsFormOpen(false);
      fetchTeamMembers();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error creating account." });
    }
  };

  const handleViewDetails = async (member: TeamMemberItem) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/team/${member.id}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSelectedMemberDetails(json.data);
        setIsDetailsOpen(true);
      } else {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to load member details." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to fetch workload details." });
    } finally {
      setIsLoading(false);
    }
  };

  if (errorMsg && errorMsg.includes("Access Denied")) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            User Management and Team Directory configuration are restricted to Co-Founders.
          </p>
        </div>
      </div>
    );
  }

  const cofoundersCount = members.filter((m) => m.role === "CO_FOUNDER").length;
  const internsCount = members.filter((m) => m.role === "INTERN").length;
  const totalActiveTasks = members.reduce((sum, m) => sum + m.workload.activeTasksCount, 0);

  return (
    <div className="space-y-6 p-6">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Team directory, roles, departments, responsibilities & operational workload tracking
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          + Add User Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Total Users</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{members.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Co-Founders</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{cofoundersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Interns & Staff</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{internsCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Active Operational Tasks</span>
          <span className="text-2xl font-black text-teal-600 mt-1 block">{totalActiveTasks}</span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState label="Loading user directory & workloads..." />
      ) : members.length === 0 ? (
        <EmptyState
          title="No Users Registered"
          description="Register user accounts to manage team responsibilities."
          actionLabel="+ Add User Account"
          onAction={() => setIsFormOpen(true)}
        />
      ) : (
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <TeamListTable
            members={members}
            onViewDetails={handleViewDetails}
            onEditMember={(m) => setEditingMember(m)}
          />
        </div>
      )}

      {/* Modals */}
      <InternFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateInternSubmit}
      />

      <TeamMemberDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        member={selectedMemberDetails}
      />

      <UserEditModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onSuccess={fetchTeamMembers}
      />
    </div>
  );
}
