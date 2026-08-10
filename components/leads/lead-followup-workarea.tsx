"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Check,
  RefreshCw,
  PhoneCall,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadFollowUpItem, FollowUpWorkAreaSummary, FollowUpType, LeadItem } from "@/types/lead";
import { formatDate } from "@/lib/utils";

export interface LeadFollowUpWorkAreaProps {
  onViewLeadDetails: (leadId: string) => void;
  onLogCallForLead: (leadId: string, leadName: string) => void;
}

export function LeadFollowUpWorkArea({
  onViewLeadDetails,
  onLogCallForLead,
}: LeadFollowUpWorkAreaProps) {
  const [activeTab, setActiveTab] = React.useState<"today" | "overdue" | "upcoming" | "completed" | "all">("today");
  const [followUps, setFollowUps] = React.useState<LeadFollowUpItem[]>([]);
  const [summary, setSummary] = React.useState<FollowUpWorkAreaSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const fetchFollowUps = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: activeTab });
      const res = await fetch(`/api/leads/follow-ups/workarea?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setFollowUps(json.data.followUps);
        setSummary(json.data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch follow-ups workarea:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleToggleComplete = async (followUp: LeadFollowUpItem) => {
    setTogglingId(followUp.id);
    try {
      const res = await fetch(`/api/leads/follow-ups/${followUp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !followUp.isCompleted }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchFollowUps();
      }
    } catch (e) {
      console.error("Error toggling completion:", e);
    } finally {
      setTogglingId(null);
    }
  };

  const getFollowUpIcon = (type: FollowUpType) => {
    switch (type) {
      case "CALL":
        return <Phone className="h-3.5 w-3.5 text-sky-600" />;
      case "EMAIL":
        return <Mail className="h-3.5 w-3.5 text-teal-600" />;
      case "WHATSAPP":
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />;
      case "MEETING":
        return <Users className="h-3.5 w-3.5 text-indigo-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const formatDueTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Follow-ups */}
          <button
            onClick={() => setActiveTab("today")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === "today"
                ? "border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today&apos;s Follow-ups
              </span>
              <Clock className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.todayCount}</p>
            <span className="text-[11px] text-teal-700 font-medium mt-1 block">Scheduled for today</span>
          </button>

          {/* Overdue Follow-ups */}
          <button
            onClick={() => setActiveTab("overdue")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === "overdue"
                ? "border-rose-500 bg-rose-50/50 shadow-sm ring-1 ring-rose-500"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Overdue Follow-ups
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950 mt-1">{summary.overdueCount}</p>
            <span className="text-[11px] text-rose-700 font-medium mt-1 block">Requires immediate action</span>
          </button>

          {/* Upcoming Follow-ups */}
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === "upcoming"
                ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming
              </span>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.upcomingCount}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Scheduled for future dates</span>
          </button>

          {/* Completed Today */}
          <button
            onClick={() => setActiveTab("completed")}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === "completed"
                ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Completed Today
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-1">{summary.completedTodayCount}</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Tasks resolved today</span>
          </button>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === "today" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("today")}
            className="text-xs"
          >
            Today ({summary?.todayCount || 0})
          </Button>
          <Button
            variant={activeTab === "overdue" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overdue")}
            className="text-xs"
          >
            Overdue ({summary?.overdueCount || 0})
          </Button>
          <Button
            variant={activeTab === "upcoming" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("upcoming")}
            className="text-xs"
          >
            Upcoming ({summary?.upcomingCount || 0})
          </Button>
          <Button
            variant={activeTab === "completed" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("completed")}
            className="text-xs"
          >
            Completed
          </Button>
          <Button
            variant={activeTab === "all" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="text-xs"
          >
            All Follow-ups
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchFollowUps} title="Refresh">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Follow-ups List / Work Area */}
      {isLoading ? (
        <LoadingState label="Loading CRM follow-ups work area..." />
      ) : followUps.length === 0 ? (
        <EmptyState
          title="No Follow-ups Found"
          description={
            activeTab === "today"
              ? "Awesome! No pending follow-ups scheduled for today."
              : activeTab === "overdue"
              ? "Great job! You have no overdue follow-ups."
              : "No follow-up tasks match this view."
          }
          icon={<Clock className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {followUps.map((item) => {
            const isOverdueItem =
              !item.isCompleted && new Date(item.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                  item.isCompleted
                    ? "bg-slate-50/60 border-slate-100 opacity-75"
                    : isOverdueItem
                    ? "bg-rose-50/30 border-rose-200"
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                {/* Left: Checkbox + Lead Info */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(item)}
                    disabled={togglingId === item.id}
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      item.isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    {item.isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewLeadDetails(item.leadId)}
                        className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-sm text-left truncate"
                      >
                        {item.lead?.name || "Lead"}
                      </button>
                      {item.lead?.companyName && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({item.lead.companyName})
                        </span>
                      )}

                      {/* Type Badge */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {getFollowUpIcon(item.type)}
                        {item.type}
                      </span>

                      {/* Overdue Tag */}
                      {isOverdueItem && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          OVERDUE
                        </Badge>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2">{item.notes}</p>
                    )}

                    {/* Contact details */}
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      {item.lead?.phone && <span>📞 {item.lead.phone}</span>}
                      {item.lead?.email && <span>✉️ {item.lead.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Date/Time + Assignee + Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  {/* Due Date & Time */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold block ${
                        isOverdueItem ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {formatDate(item.dueDate)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      at {formatDueTime(item.dueDate)}
                    </span>
                  </div>

                  {/* Assignee */}
                  {item.assignedTo && (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white"
                      title={`Assigned to ${item.assignedTo.name}`}
                    >
                      {item.assignedTo.name.charAt(0)}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLogCallForLead(item.leadId, item.lead?.name || "Lead")}
                      className="text-xs text-sky-700 border-sky-200 hover:bg-sky-50 h-8"
                    >
                      <PhoneCall className="h-3.5 w-3.5 mr-1" />
                      Log Call
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewLeadDetails(item.leadId)}
                      className="h-8 w-8 text-slate-400 hover:text-slate-700"
                      title="View Lead Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
