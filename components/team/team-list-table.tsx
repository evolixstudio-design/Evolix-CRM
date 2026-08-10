"use client";

import * as React from "react";
import { Eye, Edit3, Briefcase, CheckSquare, AlertTriangle, Calendar, Phone, Building } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamMemberItem } from "@/types/team";
import { formatDate } from "@/lib/utils";

export interface TeamListTableProps {
  members: TeamMemberItem[];
  onViewDetails: (member: TeamMemberItem) => void;
  onEditMember: (member: TeamMemberItem) => void;
}

export function TeamListTable({
  members,
  onViewDetails,
  onEditMember,
}: TeamListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User / Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Department / Responsibilities</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined Date</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Workload (Proj / Tasks / Overdue)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <button
                    onClick={() => onViewDetails(m)}
                    className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left block"
                  >
                    {m.name}
                  </button>
                  <p className="text-xs text-slate-500 font-medium">{m.email}</p>
                  {m.phone && <p className="text-[10px] text-slate-400 font-mono">{m.phone}</p>}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge variant={m.role === "CO_FOUNDER" ? "default" : "info"}>
                {m.role === "CO_FOUNDER" ? "CO-FOUNDER" : "INTERN"}
              </Badge>
            </TableCell>

            <TableCell>
              {m.department ? (
                <div className="max-w-[180px]">
                  <Badge variant="outline" className="text-[11px] font-semibold bg-slate-50 border-slate-300 text-slate-700">
                    {m.department}
                  </Badge>
                </div>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </TableCell>

            <TableCell>
              {m.isActive ? (
                <Badge variant="success">ACTIVE</Badge>
              ) : (
                <Badge variant="destructive">INACTIVE</Badge>
              )}
            </TableCell>

            <TableCell className="text-xs text-slate-600 font-medium">
              {formatDate(m.createdAt)}
            </TableCell>

            <TableCell className="text-xs text-slate-600 font-medium">
              {m.lastActivityAt ? formatDate(m.lastActivityAt) : "—"}
            </TableCell>

            <TableCell>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="text-indigo-600" title="Active Projects">
                  {m.workload.activeProjectsCount} Proj
                </span>
                <span className="text-teal-600" title="Active Tasks">
                  {m.workload.activeTasksCount} Tasks
                </span>
                {m.workload.overdueTasksCount > 0 ? (
                  <span className="text-rose-600 font-bold" title="Overdue Tasks">
                    {m.workload.overdueTasksCount} Overdue
                  </span>
                ) : (
                  <span className="text-slate-400">0 Overdue</span>
                )}
              </div>
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(m)}
                  title="View Workload Details"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditMember(m)}
                  title="Edit User Info"
                >
                  <Edit3 className="h-4 w-4 text-teal-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
