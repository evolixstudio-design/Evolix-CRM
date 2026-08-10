"use client";

import * as React from "react";
import { Eye, Edit2, Calendar, Building, Users } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/types/project";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProjectStatus, ProjectPriority } from "@prisma/client";

export interface ProjectListTableProps {
  projects: ProjectItem[];
  userRole?: string;
  onViewDetails: (project: ProjectItem) => void;
  onEditProject: (project: ProjectItem) => void;
}

export function ProjectListTable({
  projects,
  userRole = "CO_FOUNDER",
  onViewDetails,
  onEditProject,
}: ProjectListTableProps) {
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">COMPLETED</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "ON_HOLD":
        return <Badge variant="warning">ON HOLD</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="default">PLANNING</Badge>;
    }
  };

  const getPriorityBadge = (priority: ProjectPriority) => {
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
          <TableHead>Project & Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Team Members</TableHead>
          <TableHead>Deadline</TableHead>
          {userRole === "CO_FOUNDER" && <TableHead>Contract Value</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <button
                  onClick={() => onViewDetails(project)}
                  className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left"
                >
                  {project.name}
                </button>
                <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                  <Building className="h-3 w-3 mr-1 text-slate-400" />
                  {project.client.name}
                </p>
              </div>
            </TableCell>

            <TableCell>{getStatusBadge(project.status)}</TableCell>

            <TableCell>{getPriorityBadge(project.priority)}</TableCell>

            <TableCell>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                {project.serviceType.replace("_", " ")}
              </span>
            </TableCell>

            <TableCell>
              <div className="w-28 space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span>{project.progressPercentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {project.members.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white ring-2 ring-white"
                    title={`${m.user.name} (${m.role})`}
                  >
                    {m.user.name.charAt(0)}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              {project.deadline ? (
                <div className="flex items-center space-x-1 text-xs text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDate(project.deadline)}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </TableCell>

            {userRole === "CO_FOUNDER" && (
              <TableCell className="font-semibold text-slate-900">
                {project.contractValue !== undefined ? formatCurrency(project.contractValue) : "—"}
              </TableCell>
            )}

            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(project)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditProject(project)}
                  title="Edit Project"
                >
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
