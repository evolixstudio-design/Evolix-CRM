"use client";

import * as React from "react";
import { Eye, Edit2, Calendar, FolderKanban, Building, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/types/task";
import { formatDate } from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface TaskListTableProps {
  tasks: TaskItem[];
  userRole?: string;
  onViewDetails: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask?: (task: TaskItem) => void;
}

export function TaskListTable({
  tasks,
  userRole = "CO_FOUNDER",
  onViewDetails,
  onEditTask,
  onDeleteTask,
}: TaskListTableProps) {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "ASSIGNED":
        return <Badge variant="warning">ASSIGNED</Badge>;
      case "ACCEPTED":
        return <Badge variant="info">ACCEPTED</Badge>;
      case "DECLINED":
        return <Badge variant="destructive">DECLINED</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">SUBMITTED</Badge>;
      case "COMPLETED":
        return <Badge variant="success">COMPLETED</Badge>;
      case "CANCELLED":
        return <Badge variant="default">CANCELLED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">URGENT</Badge>;
      case "HIGH":
        return <Badge variant="warning">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="info">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="outline">LOW</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Title & Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Project / Client</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <button
                  onClick={() => onViewDetails(task)}
                  className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left"
                >
                  {task.title}
                </button>
                {task.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xs font-normal">
                    {task.description}
                  </p>
                )}
              </div>
            </TableCell>

            <TableCell>{getStatusBadge(task.status)}</TableCell>

            <TableCell>{getPriorityBadge(task.priority)}</TableCell>

            <TableCell>
              <div className="space-y-0.5 text-xs">
                {task.project ? (
                  <p className="font-semibold text-slate-800 flex items-center">
                    <FolderKanban className="h-3 w-3 mr-1 text-slate-400" />
                    {task.project.name}
                  </p>
                ) : task.client ? (
                  <p className="font-semibold text-slate-700 flex items-center">
                    <Building className="h-3 w-3 mr-1 text-slate-400" />
                    {task.client.name}
                  </p>
                ) : (
                  <span className="text-slate-400 italic">—</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              {task.assignedTo ? (
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                    {task.assignedTo.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                    {task.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Unassigned</span>
              )}
            </TableCell>

            <TableCell>
              {task.dueDate ? (
                <div className="flex items-center space-x-1 text-xs text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(task)}
                  title="View Task Details"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditTask(task)}
                  title="Edit Task"
                >
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
                {userRole === "CO_FOUNDER" && onDeleteTask && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTask(task)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
