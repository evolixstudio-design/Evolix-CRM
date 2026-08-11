"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { Plus, Target, RefreshCw, Clock, Filter, PhoneCall, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadFilterBar } from "@/components/leads/lead-filter-bar";
import { LeadListTable } from "@/components/leads/lead-list-table";
import { LeadFormModal } from "@/components/leads/lead-form-modal";
import { LeadDetailsModal } from "@/components/leads/lead-details-modal";
import { LeadCallModal } from "@/components/leads/lead-call-modal";
import { LeadFollowUpModal } from "@/components/leads/lead-followup-modal";
import { LeadFollowUpWorkArea } from "@/components/leads/lead-followup-workarea";
import { MeetingFormModal } from "@/components/meetings/meeting-form-modal";
import { MeetingWorkArea } from "@/components/meetings/meeting-workarea";
import { LeadItem, LeadActivityItem, LeadFollowUpItem, CallOutcome, FollowUpType } from "@/types/lead";
import { MeetingType } from "@/types/meeting";
import { LeadStatus, LeadActivityType } from "@prisma/client";

export default function LeadsPage() {
  const [mainTab, setMainTab] = React.useState<"pipeline" | "workarea" | "meetings">("pipeline");

  const [leads, setLeads] = React.useState<LeadItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState("");

  // Co-Founders list
  const [coFounders, setCoFounders] = React.useState<{ id: string; name: string }[]>([]);

  // Meeting modal state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = React.useState(false);
  const [meetingTargetLead, setMeetingTargetLead] = React.useState<{ id: string; name: string } | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<LeadItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = React.useState<(LeadItem & { activities?: LeadActivityItem[]; followUps?: LeadFollowUpItem[] }) | null>(null);

  // Call & FollowUp modals
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
  const [callTargetLead, setCallTargetLead] = React.useState<{ id: string; name: string } | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = React.useState(false);
  const [followUpTargetLead, setFollowUpTargetLead] = React.useState<{ id: string; name: string } | null>(null);

  const [convertTargetLead, setConvertTargetLead] = React.useState<LeadItem | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [deletingLead, setDeletingLead] = React.useState<LeadItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);


  // Fetch Co-Founders for dropdowns
  const fetchCoFounders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success && json.data?.teamWorkload) {
        setCoFounders(
          json.data.teamWorkload.map((m: any) => ({ id: m.userId, name: m.name }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch cofounders:", e);
    }
  }, []);

  // Fetch Leads with search & filters
  const fetchLeads = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (sourceFilter) params.set("source", sourceFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 403) {
          setErrorMsg("Access Denied: Leads management is restricted to Co-Founders.");
        } else {
          setErrorMsg(json.error?.message || "Failed to fetch leads.");
        }
        setIsLoading(false);
        return;
      }

      setLeads(json.data.leads);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setErrorMsg("Network error fetching leads.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, sourceFilter]);

  React.useEffect(() => {
    fetchCoFounders();
  }, [fetchCoFounders]);

  React.useEffect(() => {
    if (mainTab === "pipeline") {
      fetchLeads();
    }
  }, [fetchLeads, mainTab]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setSourceFilter("");
    setPage(1);
  };

  const handleCreateOpen = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (lead: LeadItem) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingLead);
      const url = isEditing ? `/api/leads/${editingLead!.id}` : "/api/leads";
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
          message: json.error?.message || "Failed to save lead.",
        });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Lead Updated" : "Lead Created",
        message: `Successfully saved ${json.data.name}`,
      });
      setIsFormOpen(false);
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving lead." });
    }
  };

  const handleViewDetails = async (leadId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSelectedLeadDetails(json.data);
        setIsDetailsOpen(true);
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to load lead details." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedLeadDetails((prev) => (prev ? { ...prev, ...json.data } : null));
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignChange = async (leadId: string, founderId: string | null) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: founderId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedLeadDetails((prev) => (prev ? { ...prev, ...json.data } : null));
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddActivity = async (leadId: string, type: LeadActivityType, content: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        handleViewDetails(leadId);
        setToast({ type: "success", title: "Activity Logged", message: "Successfully added timeline entry." });
      }
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Failed to log activity." });
    }
  };

  const handleOpenLogCall = (lead: { id: string; name: string }) => {
    setCallTargetLead({ id: lead.id, name: lead.name });
    setIsCallModalOpen(true);
  };

  const handleLogCallSubmit = async (data: {
    outcome: CallOutcome;
    notes?: string;
    callDate?: string;
    nextFollowUpAt?: string;
    nextMeetingAt?: string;
  }) => {
    if (!callTargetLead) return;
    try {
      const res = await fetch(`/api/leads/${callTargetLead.id}/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to log call." });
        return;
      }

      setToast({ type: "success", title: "Call Logged!", message: `Logged call for ${callTargetLead.name}.` });
      setIsCallModalOpen(false);
      setCallTargetLead(null);
      if (selectedLeadDetails?.id === callTargetLead.id) {
        handleViewDetails(callTargetLead.id);
      }
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error logging call." });
    }
  };

  const handleOpenAddFollowUp = (lead: { id: string; name: string }) => {
    setFollowUpTargetLead({ id: lead.id, name: lead.name });
    setIsFollowUpModalOpen(true);
  };

  const handleCreateFollowUpSubmit = async (data: {
    type: FollowUpType;
    dueDate: string;
    notes?: string;
    assignedToId?: string;
  }) => {
    if (!followUpTargetLead) return;
    try {
      const res = await fetch(`/api/leads/${followUpTargetLead.id}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to schedule follow-up." });
        return;
      }

      setToast({ type: "success", title: "Follow-up Scheduled!", message: `Scheduled follow-up for ${followUpTargetLead.name}.` });
      setIsFollowUpModalOpen(false);
      setFollowUpTargetLead(null);
      if (selectedLeadDetails?.id === followUpTargetLead.id) {
        handleViewDetails(followUpTargetLead.id);
      }
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error scheduling follow-up." });
    }
  };

  const handleToggleFollowUpComplete = async (followUpId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/leads/follow-ups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      const json = await res.json();
      if (res.ok && json.success && selectedLeadDetails) {
        handleViewDetails(selectedLeadDetails.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenScheduleMeeting = (target?: { id: string; name: string }) => {
    if (target) {
      setMeetingTargetLead({ id: target.id, name: target.name });
    } else {
      setMeetingTargetLead(null);
    }
    setIsMeetingModalOpen(true);
  };

  const handleScheduleMeetingSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Error", message: json.error?.message || "Failed to schedule meeting." });
        return;
      }

      setToast({ type: "success", title: "Meeting Scheduled!", message: `Successfully scheduled '${json.data.title}'.` });
      setIsMeetingModalOpen(false);
      setMeetingTargetLead(null);
      if (selectedLeadDetails && selectedLeadDetails.id === data.leadId) {
        handleViewDetails(selectedLeadDetails.id);
      }
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error scheduling meeting." });
    }
  };

  const handleConfirmConvert = async () => {
    if (!convertTargetLead) return;

    setIsConverting(true);
    try {
      const res = await fetch(`/api/leads/${convertTargetLead.id}/convert`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Conversion Failed",
          message: json.error?.message || "Failed to convert lead to client.",
        });
        setIsConverting(false);
        setConvertTargetLead(null);
        return;
      }

      setToast({
        type: "success",
        title: "Lead Converted!",
        message: `Successfully created Client '${json.data.client.name}' and initialized Onboarding.`,
      });
      setIsConverting(false);
      setConvertTargetLead(null);
      setIsDetailsOpen(false);
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error during conversion." });
      setIsConverting(false);
      setConvertTargetLead(null);
    }
  };

  const handleDeleteLeadConfirm = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deletingLead.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Delete Failed",
          message: json.error?.message || "Failed to delete lead.",
        });
        return;
      }
      setToast({
        type: "success",
        title: "Lead Deleted",
        message: `Successfully deleted lead '${deletingLead.name}'.`,
      });
      setDeletingLead(null);
      fetchLeads();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error deleting lead." });
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
            <h1 className="text-2xl font-bold text-slate-900">Lead CRM & Pipeline</h1>
            <Badge variant="default">CO_FOUNDER Access</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track sales inquiries, log call outcomes, manage follow-up tasks, and convert deals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchLeads} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateOpen}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setMainTab("pipeline")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            mainTab === "pipeline"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Leads Pipeline</span>
        </button>

        <button
          onClick={() => setMainTab("workarea")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            mainTab === "workarea"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock className="h-4 w-4 text-teal-600" />
          <span>Today&apos;s Follow-ups & Work Area</span>
        </button>

        <button
          onClick={() => setMainTab("meetings")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            mainTab === "meetings"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span>📅 Meetings & Reminders</span>
        </button>
      </div>

      {/* TAB 1: LEADS PIPELINE */}
      {mainTab === "pipeline" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <LeadFilterBar
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            source={sourceFilter}
            onSourceChange={setSourceFilter}
            onResetFilters={handleResetFilters}
          />

          {/* Main Table / States */}
          {errorMsg ? (
            <ErrorState title="Error Loading Leads" message={errorMsg} onRetry={fetchLeads} />
          ) : isLoading ? (
            <LoadingState label="Loading leads pipeline..." />
          ) : leads.length === 0 ? (
            <EmptyState
              title="No Leads Found"
              description={
                search || statusFilter || priorityFilter || sourceFilter
                  ? "No leads match your active search filters."
                  : "No leads exist in the system yet. Click 'Add Lead' to create your first lead."
              }
              actionLabel={search || statusFilter ? "Reset Filters" : "Add Lead"}
              onAction={search || statusFilter ? handleResetFilters : handleCreateOpen}
              icon={<Target className="h-6 w-6" />}
            />
          ) : (
            <Card className="p-0 border-slate-100 overflow-hidden">
              <LeadListTable
                leads={leads}
                onViewDetails={(lead) => handleViewDetails(lead.id)}
                onEditLead={handleEditOpen}
                onConvertLead={(lead) => setConvertTargetLead(lead)}
                onDeleteLead={setDeletingLead}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing Page {page} of {totalPages} ({total} total leads)
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
        </div>
      )}

      {/* TAB 2: TODAY'S FOLLOW-UPS & WORK AREA */}
      {mainTab === "workarea" && (
        <LeadFollowUpWorkArea
          onViewLeadDetails={(leadId) => handleViewDetails(leadId)}
          onLogCallForLead={(leadId, leadName) => handleOpenLogCall({ id: leadId, name: leadName })}
        />
      )}

      {/* TAB 3: MEETINGS & CALENDAR */}
      {mainTab === "meetings" && (
        <MeetingWorkArea
          onScheduleMeeting={() => handleOpenScheduleMeeting()}
          onViewLeadDetails={(leadId) => handleViewDetails(leadId)}
        />
      )}

      {/* Form Drawer (Create / Edit Lead) */}
      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        lead={editingLead}
        coFounders={coFounders}
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        lead={selectedLeadDetails}
        coFounders={coFounders}
        onStatusChange={handleStatusChange}
        onAssignChange={handleAssignChange}
        onAddActivity={handleAddActivity}
        onConvertLead={(lead) => setConvertTargetLead(lead)}
        onLogCall={(lead) => handleOpenLogCall(lead)}
        onAddFollowUp={(lead) => handleOpenAddFollowUp(lead)}
        onScheduleMeeting={(lead) => handleOpenScheduleMeeting(lead)}
        onToggleFollowUpComplete={handleToggleFollowUpComplete}
      />

      {/* Log Call Modal */}
      <LeadCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onSubmit={handleLogCallSubmit}
        leadName={callTargetLead?.name}
      />

      {/* Schedule Follow-Up Modal */}
      <LeadFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSubmit={handleCreateFollowUpSubmit}
        leadName={followUpTargetLead?.name}
        coFounders={coFounders}
      />

      {/* Schedule Meeting Modal */}
      <MeetingFormModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSubmit={handleScheduleMeetingSubmit}
        leads={leads.map((l) => ({ id: l.id, name: l.name }))}
        presetLeadId={meetingTargetLead?.id}
        presetTitle={meetingTargetLead ? `Meeting with ${meetingTargetLead.name}` : ""}
      />

      {/* Confirm Conversion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(convertTargetLead)}
        onClose={() => setConvertTargetLead(null)}
        onConfirm={handleConfirmConvert}
        title="Convert Lead to Client?"
        description={`This action will mark '${convertTargetLead?.name}' as WON, create a new Client record, and automatically start an Onboarding workflow.`}
        confirmLabel="Convert to Client"
        variant="primary"
        isLoading={isConverting}
      />

      {/* Confirm Lead Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLead)}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteLeadConfirm}
        title="Delete Lead Record"
        description={`Are you sure you want to permanently delete lead record '${deletingLead?.name}'? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Lead"}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

