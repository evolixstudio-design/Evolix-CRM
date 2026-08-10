"use client";

import * as React from "react";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface TaskFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  projectId: string;
  onProjectChange: (value: string) => void;
  assignedToId: string;
  onAssignedToChange: (value: string) => void;
  myTasksOnly: boolean;
  onMyTasksToggle: (value: boolean) => void;
  projects: { id: string; name: string }[];
  teamMembers: { id: string; name: string }[];
  userRole?: string;
  onResetFilters: () => void;
}

export function TaskFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  projectId,
  onProjectChange,
  assignedToId,
  onAssignedToChange,
  myTasksOnly,
  onMyTasksToggle,
  projects,
  teamMembers,
  userRole = "CO_FOUNDER",
  onResetFilters,
}: TaskFilterBarProps) {
  const hasActiveFilters = search || status || priority || projectId || assignedToId || myTasksOnly;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tasks by title, description, project..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-xs"
          />
        </div>

        {userRole === "CO_FOUNDER" && (
          <div className="flex items-center space-x-2">
            <Button
              variant={myTasksOnly ? "primary" : "outline"}
              size="sm"
              onClick={() => onMyTasksToggle(!myTasksOnly)}
              className="text-xs"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              {myTasksOnly ? "Showing My Tasks" : "Filter My Tasks"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <div className="w-36">
          <Select
            placeholder="All Statuses"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { label: "Assigned", value: TaskStatus.ASSIGNED },
              { label: "Accepted", value: TaskStatus.ACCEPTED },
              { label: "Declined", value: TaskStatus.DECLINED },
              { label: "In Progress", value: TaskStatus.IN_PROGRESS },
              { label: "Submitted", value: TaskStatus.SUBMITTED },
              { label: "Completed", value: TaskStatus.COMPLETED },
              { label: "Cancelled", value: TaskStatus.CANCELLED },
            ]}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-32">
          <Select
            placeholder="All Priorities"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            options={[
              { label: "Low", value: TaskPriority.LOW },
              { label: "Medium", value: TaskPriority.MEDIUM },
              { label: "High", value: TaskPriority.HIGH },
              { label: "Urgent", value: TaskPriority.URGENT },
            ]}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-40">
          <Select
            placeholder="All Projects"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            className="h-9 text-xs"
          />
        </div>

        {userRole === "CO_FOUNDER" && !myTasksOnly && (
          <div className="w-40">
            <Select
              placeholder="All Assignees"
              value={assignedToId}
              onChange={(e) => onAssignedToChange(e.target.value)}
              options={teamMembers.map((m) => ({ label: m.name, value: m.id }))}
              className="h-9 text-xs"
            />
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-slate-900 ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
