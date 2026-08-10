"use client";

import * as React from "react";
import { Briefcase, CheckSquare, Clock, AlertTriangle, UserCheck, UserX } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamMemberItem } from "@/types/team";

export interface TeamMemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberItem | null;
  onToggleStatus?: (member: TeamMemberItem) => Promise<void>;
  isLoading?: boolean;
}

export function TeamMemberDetailsModal({
  isOpen,
  onClose,
  member,
  onToggleStatus,
  isLoading = false,
}: TeamMemberDetailsModalProps) {
  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <Badge variant={member.role === "CO_FOUNDER" ? "default" : "info"}>
                  {member.role === "CO_FOUNDER" ? "CO-FOUNDER" : "INTERN"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{member.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={member.isActive ? "outline" : "primary"}
              size="sm"
              onClick={() => onToggleStatus && onToggleStatus(member)}
              disabled={isLoading}
            >
              {member.isActive ? (
                <>
                  <UserX className="h-3.5 w-3.5 mr-1 text-rose-600" />
                  Deactivate Account
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Activate Account
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Operational Workload Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <Briefcase className="h-4 w-4 mx-auto text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
              Active Projects
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {member.workload.activeProjectsCount}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <CheckSquare className="h-4 w-4 mx-auto text-teal-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
              Active Tasks
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {member.workload.activeTasksCount}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-amber-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
              Pending Tasks
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              {member.workload.pendingTasksCount}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-rose-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
              Overdue Tasks
            </span>
            <span className="text-lg font-bold text-rose-600 mt-0.5 block">
              {member.workload.overdueTasksCount}
            </span>
          </div>
        </div>

        {/* Assigned Projects Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assigned Projects ({member.projects ? member.projects.length : 0})
          </h4>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {member.projects && member.projects.length > 0 ? (
              member.projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-white text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="ml-2 text-slate-400">({p.serviceType})</span>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No assigned projects found.</p>
            )}
          </div>
        </div>

        {/* Assigned Tasks Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assigned Tasks ({member.tasks ? member.tasks.length : 0})
          </h4>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {member.tasks && member.tasks.length > 0 ? (
              member.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-white text-xs">
                  <span className="font-medium text-slate-900">{t.title}</span>
                  <Badge variant={t.status === "COMPLETED" ? "success" : "info"}>
                    {t.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No assigned tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
