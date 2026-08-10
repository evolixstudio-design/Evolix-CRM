"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  Clock,
  CheckCircle2,
  LogOut,
  LogIn,
  Calendar,
  UserCheck,
  Search,
  Filter,
  AlertCircle,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { AttendanceItem, TodayAttendanceStatus, AttendanceStatusType } from "@/types/attendance";
import { formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const [user, setUser] = React.useState<any>(null);
  const [todayStatus, setTodayStatus] = React.useState<TodayAttendanceStatus | null>(null);
  const [attendanceList, setAttendanceList] = React.useState<AttendanceItem[]>([]);
  const [summary, setSummary] = React.useState<any>(null);
  const [teamUsers, setTeamUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Check In/Out Notes
  const [checkInNotes, setCheckInNotes] = React.useState("");
  const [checkOutNotes, setCheckOutNotes] = React.useState("");

  // Filters
  const [selectedUserFilter, setSelectedUserFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [startDateFilter, setStartDateFilter] = React.useState("");
  const [endDateFilter, setEndDateFilter] = React.useState("");

  // Edit Modal for Co-Founder
  const [editingRecord, setEditingRecord] = React.useState<AttendanceItem | null>(null);
  const [editStatus, setEditStatus] = React.useState<AttendanceStatusType>("PRESENT");
  const [editNotes, setEditNotes] = React.useState("");

  const fetchAuthUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const res = await fetch("/api/attendance/today");
      const json = await res.json();
      if (json.success) {
        setTodayStatus(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      let query = `/api/attendance?page=1&limit=50`;
      if (selectedUserFilter) query += `&userId=${selectedUserFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (startDateFilter) query += `&startDate=${startDateFilter}`;
      if (endDateFilter) query += `&endDate=${endDateFilter}`;

      const res = await fetch(query);
      const json = await res.json();
      if (json.success) {
        setAttendanceList(json.data.records || []);
        setSummary(json.data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamUsers = async () => {
    try {
      const res = await fetch("/api/team");
      const json = await res.json();
      if (json.success) {
        setTeamUsers(json.data.members || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchAuthUser();
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchTodayStatus();
      fetchAttendanceRecords();
      if (user.role === "CO_FOUNDER") {
        fetchTeamUsers();
      }
    }
  }, [user, selectedUserFilter, statusFilter, startDateFilter, endDateFilter]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: checkInNotes || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Check-in failed.");
      }
      setCheckInNotes("");
      await fetchTodayStatus();
      await fetchAttendanceRecords();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: checkOutNotes || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Check-out failed.");
      }
      setCheckOutNotes("");
      await fetchTodayStatus();
      await fetchAttendanceRecords();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during check-out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/attendance/${editingRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingRecord(null);
        await fetchAttendanceRecords();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatusType) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="success">Present</Badge>;
      case "HALF_DAY":
        return <Badge variant="warning">Half Day</Badge>;
      case "ABSENT":
        return <Badge variant="destructive">Absent</Badge>;
      case "LEAVE":
        return <Badge variant="info">On Leave</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDuration = (mins: number | null) => {
    if (mins === null) return "—";
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attendance</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daily check-in / check-out and attendance records (Asia/Kolkata IST)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TODAY CHECK-IN / CHECK-OUT ACTION WIDGET */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="h-4 w-4" />
              <span>Today in Asia/Kolkata (IST)</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              {todayStatus?.hasCheckedIn && (
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Checked In: {todayStatus.checkInTime}
                </span>
              )}

              {todayStatus?.hasCheckedOut && (
                <span className="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-lg border border-sky-500/30 font-semibold flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Checked Out: {todayStatus.checkOutTime} ({formatDuration(todayStatus.durationMinutes)})
                </span>
              )}

              {todayStatus?.status && getStatusBadge(todayStatus.status)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-full md:w-auto min-w-[280px]">
            {!todayStatus?.hasCheckedIn ? (
              <form onSubmit={handleCheckIn} className="space-y-3">
                <Input
                  placeholder="Optional check-in notes..."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 text-xs shadow-lg shadow-emerald-900/30"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Checking in..." : "Check In Now"}
                </Button>
              </form>
            ) : !todayStatus?.hasCheckedOut ? (
              <form onSubmit={handleCheckOut} className="space-y-3">
                <Input
                  placeholder="Optional check-out notes..."
                  value={checkOutNotes}
                  onChange={(e) => setCheckOutNotes(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-10 text-xs shadow-lg shadow-rose-900/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Checking out..." : "Check Out"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-2 space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Attendance Completed Today</span>
                <span className="text-[10px] text-slate-400 block">
                  Checked in at {todayStatus.checkInTime} • Out at {todayStatus.checkOutTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY STATS & FILTERS */}
      <div className="space-y-4">
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Records</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">{summary.totalRecords}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase block">Present</span>
              <span className="text-xl font-black text-emerald-600 mt-0.5 block">{summary.presentCount}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-amber-500 font-semibold uppercase block">Half Day</span>
              <span className="text-xl font-black text-amber-600 mt-0.5 block">{summary.halfDayCount}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-rose-500 font-semibold uppercase block">Absent</span>
              <span className="text-xl font-black text-rose-600 mt-0.5 block">{summary.absentCount}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-sky-500 font-semibold uppercase block">On Leave</span>
              <span className="text-xl font-black text-sky-600 mt-0.5 block">{summary.leaveCount}</span>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {user?.role === "CO_FOUNDER" && (
              <Select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                options={teamUsers.map((u) => ({
                  label: `${u.name} (${u.role})`,
                  value: u.id,
                }))}
                placeholder="All Team Members"
                className="w-48 text-xs"
              />
            )}

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Present", value: "PRESENT" },
                { label: "Half Day", value: "HALF_DAY" },
                { label: "Absent", value: "ABSENT" },
                { label: "Leave", value: "LEAVE" },
              ]}
              placeholder="All Statuses"
              className="w-36 text-xs"
            />

            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              placeholder="Start Date"
              className="w-36 text-xs"
            />

            <Input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              placeholder="End Date"
              className="w-36 text-xs"
            />
          </div>

          {(selectedUserFilter || statusFilter || startDateFilter || endDateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUserFilter("");
                setStatusFilter("");
                setStartDateFilter("");
                setEndDateFilter("");
              }}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Attendance Records Table */}
        {isLoading ? (
          <LoadingState label="Loading attendance logs..." />
        ) : attendanceList.length === 0 ? (
          <EmptyState
            title="No Attendance Records Found"
            description="Checked-in attendance logs will appear here."
          />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  {user?.role === "CO_FOUNDER" && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{rec.user.name}</span>
                      <span className="text-[10px] text-slate-400">{rec.user.role}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">{formatDate(rec.date)}</td>

                    <td className="py-3 px-4 font-medium text-emerald-700">
                      {rec.checkIn
                        ? new Date(rec.checkIn).toLocaleTimeString("en-US", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </td>

                    <td className="py-3 px-4 font-medium text-sky-700">
                      {rec.checkOut
                        ? new Date(rec.checkOut).toLocaleTimeString("en-US", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">{formatDuration(rec.durationMinutes)}</td>

                    <td className="py-3 px-4">{getStatusBadge(rec.status)}</td>

                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.notes || "—"}
                    </td>

                    {user?.role === "CO_FOUNDER" && (
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRecord(rec);
                            setEditStatus(rec.status);
                            setEditNotes(rec.notes || "");
                          }}
                          className="h-7 text-[11px]"
                        >
                          Edit
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CO-FOUNDER EDIT MODAL */}
      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} className="max-w-md">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Edit Attendance Record</h3>
            <p className="text-xs text-slate-500">
              Update status or notes for {editingRecord?.user.name} ({editingRecord?.date})
            </p>
          </div>

          <form onSubmit={handleUpdateRecord} className="space-y-3 text-xs">
            <Select
              label="Status *"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as AttendanceStatusType)}
              options={[
                { label: "Present", value: "PRESENT" },
                { label: "Half Day", value: "HALF_DAY" },
                { label: "Absent", value: "ABSENT" },
                { label: "Leave", value: "LEAVE" },
              ]}
              required
            />

            <Input
              label="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Approved leave / adjusted timings"
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
