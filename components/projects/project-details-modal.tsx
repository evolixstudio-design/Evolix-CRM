"use client";

import * as React from "react";
import {
  Building,
  Calendar,
  IndianRupee,
  Users,
  CheckSquare,
  UserPlus,
  Trash2,
  FolderKanban,
  CreditCard,
  Clock,
  Layers,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ProjectItem } from "@/types/project";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NoteAttachments } from "@/components/ui/note-attachments";
import { ProjectPhasesPanel } from "@/components/projects/project-phases-panel";

export interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  allTeamMembers: { id: string; name: string }[];
  userRole?: string;
  onAddMember: (projectId: string, userId: string) => Promise<void>;
  onRemoveMember: (projectId: string, userId: string) => Promise<void>;
  onRefreshProject?: () => Promise<void>;
  isLoading?: boolean;
}

export function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  allTeamMembers,
  userRole = "CO_FOUNDER",
  onAddMember,
  onRemoveMember,
  onRefreshProject,
  isLoading = false,
}: ProjectDetailsModalProps) {
  const [selectedMemberToAdd, setSelectedMemberToAdd] = React.useState("");

  if (!project) return null;

  const nonMembers = allTeamMembers.filter(
    (tm) => !project.members.some((m) => m.userId === tm.id)
  );

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToAdd) return;
    await onAddMember(project.id, selectedMemberToAdd);
    setSelectedMemberToAdd("");
  };

  const handleDummyRefresh = async () => {
    if (onRefreshProject) {
      await onRefreshProject();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
              <Badge variant={project.status === "COMPLETED" ? "success" : "default"}>
                {project.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {project.currency || "INR"} ₹
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
              <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
              Client: {project.client.name}
            </p>
          </div>

          {project.owner && (
            <div className="flex items-center space-x-2 bg-teal-50/80 px-3 py-1.5 rounded-lg border border-teal-100">
              <span className="text-[10px] text-teal-600 font-bold">Team Leader:</span>
              <span className="text-xs font-bold text-teal-900">{project.owner.name}</span>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium block">Service Category</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {project.serviceType.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Priority / Status</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {project.priority} • {project.status}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Duration / Deadline</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {project.duration || "—"} ({formatDate(project.deadline)})
            </span>
          </div>

          {userRole === "CO_FOUNDER" && (
            <div>
              <span className="text-slate-400 font-medium block">Contract Value (INR ₹)</span>
              <span className="font-bold text-emerald-950 mt-0.5 block">
                {project.contractValue !== undefined && project.contractValue !== null
                  ? `₹${project.contractValue.toLocaleString("en-IN")}`
                  : "—"}{" "}
                <span className="text-[10px] text-slate-400">({project.paymentStatus})</span>
              </span>
            </div>
          )}
        </div>

        {/* Project Phases & Overall Progress Panel */}
        <ProjectPhasesPanel
          projectId={project.id}
          clientId={project.clientId}
          phases={project.phases || []}
          overallProgress={project.overallProgress || project.progressPercentage || 0}
          taskCompletionPercentage={project.taskCompletionPercentage || 0}
          totalTasks={project.tasks ? project.tasks.length : 0}
          completedTasks={
            project.tasks ? project.tasks.filter((t) => t.status === "COMPLETED").length : 0
          }
          projectValue={project.projectValue || project.contractValue || 0}
          amountReceived={project.amountReceived || 0}
          amountPending={project.amountPending || 0}
          paymentStatus={project.paymentStatus || "UNPAID"}
          onRefreshProject={handleDummyRefresh}
          userRole={userRole}
        />

        {/* Description / Notes */}
        {project.description && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description & Deliverables
            </h4>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
              {project.description}
            </p>
          </div>
        )}

        {/* Team Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Assigned Team Members ({project.members.length})
              </h4>
            </div>

            {userRole === "CO_FOUNDER" && nonMembers.length > 0 && (
              <form onSubmit={handleAddMemberSubmit} className="flex items-center space-x-2">
                <Select
                  value={selectedMemberToAdd}
                  onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                  placeholder="Select member to add"
                  options={nonMembers.map((m) => ({ label: m.name, value: m.id }))}
                  className="w-44 h-8 text-xs bg-white"
                />
                <Button variant="primary" size="sm" type="submit" disabled={!selectedMemberToAdd}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-white text-xs">
                <div className="flex items-center space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-[10px]">
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{m.user.name}</span>
                    <span className="text-[10px] text-slate-400">{m.user.email}</span>
                  </div>
                </div>

                {userRole === "CO_FOUNDER" && m.role !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMember(project.id, m.userId)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-sky-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Project Tasks ({project.tasks ? project.tasks.length : 0})
            </h4>
          </div>

          <div className="space-y-1.5">
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-white text-xs">
                  <div>
                    <span className="font-medium text-slate-900">{t.title}</span>
                    {t.assignedTo && (
                      <span className="ml-2 text-slate-400">({t.assignedTo.name})</span>
                    )}
                  </div>
                  <Badge variant={t.status === "COMPLETED" ? "success" : "info"}>
                    {t.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No tasks created for this project yet.</p>
            )}
          </div>
        </div>

        {/* File Attachments */}
        <NoteAttachments entityType="PROJECT" entityId={project.id} />
      </div>
    </Modal>
  );
}
