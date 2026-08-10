"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  XCircle,
  Bell,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { MeetingItem, MeetingWorkAreaSummary, MeetingType, MeetingStatus } from "@/types/meeting";
import { formatDate } from "@/lib/utils";

export interface MeetingWorkAreaProps {
  onScheduleMeeting: () => void;
  onViewLeadDetails?: (leadId: string) => void;
}

export function MeetingWorkArea({ onScheduleMeeting, onViewLeadDetails }: MeetingWorkAreaProps) {
  const [activeTab, setActiveTab] = React.useState<"today" | "upcoming" | "overdue" | "completed" | "all">("today");
  const [meetings, setMeetings] = React.useState<MeetingItem[]>([]);
  const [summary, setSummary] = React.useState<MeetingWorkAreaSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchMeetings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: activeTab });
      const res = await fetch(`/api/meetings/workarea?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setMeetings(json.data.meetings);
        setSummary(json.data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch meetings workarea:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleUpdateStatus = async (meetingId: string, status: MeetingStatus) => {
    setUpdatingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchMeetings();
      }
    } catch (e) {
      console.error("Error updating meeting status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getMeetingTypeBadge = (type: MeetingType) => {
    switch (type) {
      case "GOOGLE_MEET":
        return <Badge variant="info" className="bg-sky-50 text-sky-700 border-sky-200">📹 Google Meet</Badge>;
      case "ZOOM":
        return <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">🎥 Zoom Video</Badge>;
      case "ONLINE":
        return <Badge variant="info" className="bg-teal-50 text-teal-700 border-teal-200">🌐 Online</Badge>;
      case "OFFLINE":
        return <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">📍 In-Person</Badge>;
      case "PHONE":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">📞 Phone</Badge>;
      default:
        return <Badge variant="outline">📋 Meeting</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Meetings */}
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
                Today&apos;s Meetings
              </span>
              <Calendar className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.todayCount}</p>
            <span className="text-[11px] text-teal-700 font-medium mt-1 block">Scheduled for today</span>
          </button>

          {/* Upcoming Meetings */}
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
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.upcomingCount}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Scheduled future meetings</span>
          </button>

          {/* Overdue/Missed Meetings */}
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
                Overdue / Pending
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950 mt-1">{summary.overdueCount}</p>
            <span className="text-[11px] text-rose-700 font-medium mt-1 block">Past due scheduled meetings</span>
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
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-1">{summary.completedTodayCount}</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Resolved meetings</span>
          </button>
        </div>
      )}

      {/* Filter Tabs Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-2">
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
            variant={activeTab === "upcoming" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("upcoming")}
            className="text-xs"
          >
            Upcoming ({summary?.upcomingCount || 0})
          </Button>
          <Button
            variant={activeTab === "overdue" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overdue")}
            className="text-xs"
          >
            Overdue / Pending ({summary?.overdueCount || 0})
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
            All Meetings
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={fetchMeetings} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="primary" size="sm" onClick={onScheduleMeeting} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      {isLoading ? (
        <LoadingState label="Loading meetings calendar & reminders..." />
      ) : meetings.length === 0 ? (
        <EmptyState
          title="No Meetings Found"
          description={
            activeTab === "today"
              ? "No meetings scheduled for today."
              : activeTab === "overdue"
              ? "No overdue meetings."
              : "No meetings match this filter view."
          }
          actionLabel="Schedule Meeting"
          onAction={onScheduleMeeting}
          icon={<Calendar className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {meetings.map((item) => (
            <Card
              key={item.id}
              className={`p-4 border transition-all ${
                item.status === "COMPLETED"
                  ? "bg-slate-50/60 border-slate-100 opacity-75"
                  : item.status === "CANCELLED"
                  ? "bg-rose-50/20 border-rose-100"
                  : "bg-white border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Meeting Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    {getMeetingTypeBadge(item.type)}
                    <Badge variant={item.status === "COMPLETED" ? "success" : item.status === "CANCELLED" ? "destructive" : "default"}>
                      {item.status}
                    </Badge>
                  </div>

                  {/* Association Link */}
                  {item.lead && (
                    <div className="text-xs text-slate-600 flex items-center">
                      <span className="text-slate-400 font-medium mr-1.5">Lead:</span>
                      {onViewLeadDetails ? (
                        <button
                          type="button"
                          onClick={() => onViewLeadDetails(item.lead!.id)}
                          className="font-bold text-teal-700 hover:underline"
                        >
                          {item.lead.name} {item.lead.companyName && `(${item.lead.companyName})`}
                        </button>
                      ) : (
                        <span className="font-bold text-slate-800">{item.lead.name}</span>
                      )}
                    </div>
                  )}

                  {item.client && (
                    <div className="text-xs text-slate-600 flex items-center">
                      <span className="text-slate-400 font-medium mr-1.5">Client:</span>
                      <span className="font-bold text-slate-800">{item.client.name}</span>
                    </div>
                  )}

                  {/* Meeting Link / Location */}
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold text-sky-600 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Join Meeting Link
                    </a>
                  )}

                  {item.location && (
                    <p className="text-xs text-slate-600 flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {item.location}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {item.notes}
                    </p>
                  )}

                  {/* Participants & Reminders */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    {item.participants && (
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1 text-slate-400" />
                        {item.participants}
                      </span>
                    )}

                    {item.reminders && item.reminders.length > 0 && (
                      <span className="flex items-center text-indigo-600 font-medium">
                        <Bell className="h-3 w-3 mr-1" />
                        {item.reminders.length} Reminders Prepared
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Date/Time + Organizer + Status Actions */}
                <div className="flex flex-col sm:items-end justify-between space-y-3 min-w-[140px]">
                  <div className="sm:text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatDate(item.meetingDate)}
                    </span>
                    <span className="text-xs font-semibold text-teal-700 block">
                      {item.startTime} – {item.endTime}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Organizer: {item.organizer.name}
                    </span>
                  </div>

                  {item.status === "SCHEDULED" && (
                    <div className="flex items-center space-x-1.5 pt-2 sm:pt-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, MeetingStatus.COMPLETED)}
                        disabled={updatingId === item.id}
                        className="h-7 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, MeetingStatus.CANCELLED)}
                        disabled={updatingId === item.id}
                        className="h-7 text-[11px] text-rose-600 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
