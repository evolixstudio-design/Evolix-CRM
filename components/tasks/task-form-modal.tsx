"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/types/task";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  task?: TaskItem | null;
  projects: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  teamMembers: { id: string; name: string }[];
  userRole?: string;
  isLoading?: boolean;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  projects,
  clients,
  teamMembers,
  userRole = "CO_FOUNDER",
  isLoading = false,
}: TaskFormModalProps) {
  const isEditing = Boolean(task);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>(TaskStatus.ASSIGNED);
  const [priority, setPriority] = React.useState<TaskPriority>(TaskPriority.MEDIUM);
  const [projectId, setProjectId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [assignedToId, setAssignedToId] = React.useState("");
  const [assignedInternId, setAssignedInternId] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || TaskStatus.ASSIGNED);
      setPriority(task.priority || TaskPriority.MEDIUM);
      setProjectId(task.projectId || "");
      setClientId(task.clientId || "");
      setAssignedToId(task.assignedToId || "");
      setAssignedInternId(task.assignedInternId || "");
      setStartDate(task.startDate ? task.startDate.split("T")[0] : "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.ASSIGNED);
      setPriority(TaskPriority.MEDIUM);
      setProjectId(projects[0]?.id || "");
      setClientId(clients[0]?.id || "");
      setAssignedToId(teamMembers[0]?.id || "");
      setAssignedInternId("");
      setStartDate("");
      setDueDate("");
    }
  }, [task, isOpen, projects, clients, teamMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description: description || null,
      status,
      priority,
      projectId: projectId || null,
      clientId: clientId || null,
      assignedToId: assignedToId || null,
      assignedInternId: assignedInternId || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };
    await onSubmit(payload);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      description={
        isEditing
          ? "Update task status, priority, or assigned Team Leader."
          : "Create a new deliverable task and assign to a Team Leader."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Task Title *"
          placeholder="e.g. Design homepage hero section"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={userRole === "INTERN" && isEditing}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Client *"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            options={clients.map((c) => ({ label: c.name, value: c.id }))}
            disabled={userRole === "INTERN" && isEditing}
          />

          <Select
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            disabled={userRole === "INTERN" && isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assigned Team Leader (Co-Founder) *"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            options={teamMembers.map((m) => ({ label: `👤 ${m.name}`, value: m.id }))}
            disabled={userRole === "INTERN" && isEditing}
          />

          <Select
            label="Assigned Intern (Optional)"
            value={assignedInternId}
            onChange={(e) => setAssignedInternId(e.target.value)}
            options={[
              { label: "None", value: "" },
              ...teamMembers.map((m) => ({ label: `🎓 ${m.name}`, value: m.id })),
            ]}
            disabled={userRole === "INTERN" && isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Task Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { label: "Assigned", value: TaskStatus.ASSIGNED },
              { label: "Accepted", value: TaskStatus.ACCEPTED },
              { label: "Declined", value: TaskStatus.DECLINED },
              { label: "In Progress", value: TaskStatus.IN_PROGRESS },
              { label: "Submitted", value: TaskStatus.SUBMITTED },
              { label: "Completed", value: TaskStatus.COMPLETED },
              { label: "Cancelled", value: TaskStatus.CANCELLED },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { label: "Low", value: TaskPriority.LOW },
              { label: "Medium", value: TaskPriority.MEDIUM },
              { label: "High", value: TaskPriority.HIGH },
              { label: "Urgent", value: TaskPriority.URGENT },
            ]}
            disabled={userRole === "INTERN" && isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={userRole === "INTERN" && isEditing}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={userRole === "INTERN" && isEditing}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Task Instructions & Description</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Detailed instructions, design links, technical requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Save Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
