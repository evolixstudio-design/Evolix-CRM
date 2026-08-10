"use client";

import * as React from "react";
import {
  Calendar,
  Building,
  FolderKanban,
  User,
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  ArrowRight,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskItem } from "@/types/task";
import { formatDate } from "@/lib/utils";
import { TaskStatus } from "@prisma/client";
import { NoteAttachments } from "@/components/ui/note-attachments";
import { TaskDeclineModal } from "@/components/tasks/task-decline-modal";

export interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  userRole?: string;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  onAcceptTask?: (taskId: string) => Promise<void>;
  onDeclineTask?: (taskId: string, reason: string) => Promise<void>;
  onAddComment: (taskId: string, content: string) => Promise<void>;
  onAddAttachment?: (taskId: string, fileData: any) => Promise<void>;
  isLoading?: boolean;
}

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  userRole = "CO_FOUNDER",
  onStatusChange,
  onAcceptTask,
  onDeclineTask,
  onAddComment,
  isLoading = false,
}: TaskDetailsModalProps) {
  const [commentText, setCommentText] = React.useState("");
  const [isPostingComment, setIsPostingComment] = React.useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false);

  if (!task) return null;

  const handleStatusClick = async (newStatus: TaskStatus) => {
    await onStatusChange(task.id, newStatus);
  };

  const handleAcceptClick = async () => {
    if (!onAcceptTask) return;
    setIsSubmittingAction(true);
    try {
      await onAcceptTask(task.id);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!onDeclineTask) return;
    setIsSubmittingAction(true);
    try {
      await onDeclineTask(task.id, reason);
      setIsDeclineModalOpen(false);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    try {
      await onAddComment(task.id, commentText);
      setCommentText("");
    } finally {
      setIsPostingComment(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "ASSIGNED":
        return <Badge variant="warning">Assigned</Badge>;
      case "ACCEPTED":
        return <Badge variant="info">Accepted</Badge>;
      case "DECLINED":
        return <Badge variant="destructive">Declined</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">In Progress</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Submitted</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
        <div className="space-y-6">
          {/* Header & Status Workflow Bar */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-slate-900">{task.title}</h3>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Client: {task.client.name} • Project: {task.project.name}
                  {task.phase && ` • Phase: ${task.phase.name}`}
                </p>
              </div>
            </div>

            {/* Accept / Decline Action Banner for Team Leader */}
            {task.status === "ASSIGNED" && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center space-x-2 text-amber-900 font-medium">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Task assigned to you as Team Leader. Please Accept or Decline.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={isSubmittingAction}
                    className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAcceptClick}
                    disabled={isSubmittingAction}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Accept Task
                  </Button>
                </div>
              </div>
            )}

            {/* Decline Reason Callout Box */}
            {task.status === "DECLINED" && task.declineReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-rose-900 font-bold">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>Task Declined Reason:</span>
                </div>
                <p className="text-slate-700 font-medium bg-white p-2 rounded border border-rose-100">
                  {task.declineReason}
                </p>
              </div>
            )}

            {/* Workflow Status Progression */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-2 uppercase tracking-wider">
                Status Flow:
              </span>

              <Button
                variant={task.status === "ACCEPTED" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusClick(TaskStatus.ACCEPTED)}
                className="h-7 text-[11px]"
              >
                Accepted
              </Button>
              <ArrowRight className="h-3 w-3 text-slate-300" />

              <Button
                variant={task.status === "IN_PROGRESS" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusClick(TaskStatus.IN_PROGRESS)}
                className="h-7 text-[11px]"
              >
                In Progress
              </Button>
              <ArrowRight className="h-3 w-3 text-slate-300" />

              <Button
                variant={task.status === "SUBMITTED" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusClick(TaskStatus.SUBMITTED)}
                className="h-7 text-[11px]"
              >
                Submitted
              </Button>
              <ArrowRight className="h-3 w-3 text-slate-300" />

              <Button
                variant={task.status === "COMPLETED" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusClick(TaskStatus.COMPLETED)}
                className="h-7 text-[11px]"
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Task Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 font-medium block">Priority</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{task.priority}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Assigned Team Leader</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {task.assignedTo ? task.assignedTo.name : "Unassigned"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Assigned Intern</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {task.assignedIntern ? task.assignedIntern.name : "None"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Dates (Start – Due)</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {task.startDate ? formatDate(task.startDate) : "TBD"} –{" "}
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>

          {/* Instructions / Description */}
          {task.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Instructions & Details
              </h4>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-sky-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Discussion & Activity ({task.comments ? task.comments.length : 0})
              </h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-white border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-800">{c.user.name}</span>
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-700">{c.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic p-2 text-center">No comments added yet.</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="text-xs h-9"
              />
              <Button variant="primary" size="sm" type="submit" disabled={isPostingComment || !commentText.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" />
                Post
              </Button>
            </form>
          </div>

          {/* File Attachments */}
          <NoteAttachments entityType="TASK" entityId={task.id} />
        </div>
      </Modal>

      {/* Task Decline Modal */}
      <TaskDeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirmDecline={handleDeclineConfirm}
        taskTitle={task.title}
        isLoading={isSubmittingAction}
      />
    </>
  );
}
