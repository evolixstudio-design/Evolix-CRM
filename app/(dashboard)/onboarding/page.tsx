"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { Handshake, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { OnboardingCardGrid } from "@/components/onboarding/onboarding-card-grid";
import { OnboardingUpdateModal } from "@/components/onboarding/onboarding-update-modal";
import { OnboardingItem } from "@/types/client";
import { OnboardingStatus } from "@prisma/client";

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = React.useState<OnboardingItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filters
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("ALL");

  // Edit state
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [editingOnboarding, setEditingOnboarding] = React.useState<OnboardingItem | null>(null);

  const fetchOnboardings = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (search) params.set("search", search);
      if (activeTab !== "ALL") params.set("status", activeTab);

      const res = await fetch(`/api/onboarding?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to fetch onboardings.");
        setIsLoading(false);
        return;
      }

      setOnboardings(json.data.onboardings);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setErrorMsg("Network error fetching onboardings.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, activeTab]);

  React.useEffect(() => {
    fetchOnboardings();
  }, [fetchOnboardings]);

  const handleEditOpen = (ob: OnboardingItem) => {
    setEditingOnboarding(ob);
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (onboardingId: string, payload: any) => {
    try {
      const res = await fetch(`/api/onboarding/${onboardingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({
          type: "error",
          title: "Update Failed",
          message: json.error?.message || "Failed to update onboarding.",
        });
        return;
      }

      setToast({
        type: "success",
        title: "Onboarding Updated",
        message: `Successfully updated onboarding workflow for ${json.data.clientName}`,
      });
      setIsUpdateOpen(false);
      fetchOnboardings();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error updating onboarding." });
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
          <h1 className="text-2xl font-bold text-slate-900">Client Onboarding</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track new client intake, setup milestone dates, and client access checklists.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchOnboardings} title="Refresh">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          tabs={[
            { id: "ALL", label: "All Workflows" },
            { id: OnboardingStatus.NOT_STARTED, label: "Not Started" },
            { id: OnboardingStatus.IN_PROGRESS, label: "In Progress" },
            { id: OnboardingStatus.WAITING_FOR_CLIENT, label: "Waiting" },
            { id: OnboardingStatus.COMPLETED, label: "Completed" },
          ]}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
        />

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Main Grid / States */}
      {errorMsg ? (
        <ErrorState title="Error Loading Workflows" message={errorMsg} onRetry={fetchOnboardings} />
      ) : isLoading ? (
        <LoadingState label="Loading onboarding workflows..." />
      ) : onboardings.length === 0 ? (
        <EmptyState
          title="No Onboardings Found"
          description={
            search || activeTab !== "ALL"
              ? "No client onboardings match your active filters."
              : "No client onboarding workflows in progress."
          }
          icon={<Handshake className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-6">
          <OnboardingCardGrid
            onboardings={onboardings}
            onEditOnboarding={handleEditOpen}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="text-slate-500 font-medium">
                Showing Page {page} of {totalPages} ({total} total onboardings)
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
        </div>
      )}

      {/* Update Drawer */}
      <OnboardingUpdateModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        onUpdate={handleUpdateSubmit}
        onboarding={editingOnboarding}
      />
    </div>
  );
}
