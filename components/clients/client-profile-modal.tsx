"use client";

import * as React from "react";
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FolderKanban,
  CheckSquare,
  IndianRupee,
  CreditCard,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientItem } from "@/types/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NoteAttachments } from "@/components/ui/note-attachments";

export interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientItem | null;
  userRole?: string;
  onScheduleMeeting?: (client: { id: string; name: string }) => void;
}

export function ClientProfileModal({
  isOpen,
  onClose,
  client,
  userRole = "CO_FOUNDER",
  onScheduleMeeting,
}: ClientProfileModalProps) {
  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900">{client.name}</h3>
              <Badge variant={client.status === "ACTIVE" ? "success" : "default"}>
                {client.status}
              </Badge>
            </div>
            {client.companyName && (
              <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {client.companyName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onScheduleMeeting && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScheduleMeeting(client)}
                className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Schedule Meeting
              </Button>
            )}

            {client.assignedTo && (
              <div className="flex items-center space-x-1.5 bg-teal-50/80 px-2.5 py-1.5 rounded-lg border border-teal-100">
                <span className="text-[10px] text-teal-600 font-bold">Team Leader:</span>
                <span className="text-xs font-bold text-teal-900">{client.assignedTo.name}</span>
              </div>
            )}
            {client.assignedIntern && (
              <div className="flex items-center space-x-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold">Intern:</span>
                <span className="text-xs font-bold text-blue-900">{client.assignedIntern.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Cards (CO_FOUNDER ONLY) */}
        {userRole === "CO_FOUNDER" && client.financials && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800">Total Payments Paid</span>
                  <p className="text-xl font-black text-emerald-950 mt-0.5">
                    {formatCurrency(client.financials.totalPayments)}
                  </p>
                </div>
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-800">Direct Project Expenses</span>
                  <p className="text-xl font-black text-rose-950 mt-0.5">
                    {formatCurrency(client.financials.totalExpenses)}
                  </p>
                </div>
                <CreditCard className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </div>
        )}

        {/* Contact Info & Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
          {client.email && (
            <div>
              <span className="text-slate-400 font-medium block">Email</span>
              <span className="font-semibold text-slate-800 mt-0.5 flex items-center">
                <Mail className="h-3 w-3 mr-1 text-slate-400" />
                {client.email}
              </span>
            </div>
          )}
          {client.phone && (
            <div>
              <span className="text-slate-400 font-medium block">Phone</span>
              <span className="font-semibold text-slate-800 mt-0.5 flex items-center">
                <Phone className="h-3 w-3 mr-1 text-slate-400" />
                {client.phone}
              </span>
            </div>
          )}
          {client.website && (
            <div>
              <span className="text-slate-400 font-medium block">Website</span>
              <a
                href={client.website}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-teal-600 hover:underline mt-0.5 flex items-center truncate"
              >
                <Globe className="h-3 w-3 mr-1" />
                {client.website}
              </a>
            </div>
          )}
          {client.industry && (
            <div>
              <span className="text-slate-400 font-medium block">Industry</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{client.industry}</span>
            </div>
          )}
          {client.onboarding && (
            <div>
              <span className="text-slate-400 font-medium block">Onboarding Workflow</span>
              <Badge variant="outline" className="mt-0.5 text-[10px]">
                {client.onboarding.status.replace("_", " ")}
              </Badge>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Client Projects ({client.projects ? client.projects.length : 0})
            </h4>
          </div>

          <div className="space-y-1.5">
            {client.projects && client.projects.length > 0 ? (
              client.projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-white text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="ml-2 text-slate-400">({p.serviceType})</span>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No projects found for this client.</p>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-sky-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Client Tasks ({client.tasks ? client.tasks.length : 0})
            </h4>
          </div>

          <div className="space-y-1.5">
            {client.tasks && client.tasks.length > 0 ? (
              client.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-white text-xs">
                  <span className="font-medium text-slate-900">{t.title}</span>
                  <Badge variant="info">{t.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No active tasks found for this client.</p>
            )}
          </div>
        </div>

        {/* File Attachments */}
        <NoteAttachments entityType="CLIENT" entityId={client.id} />
      </div>
    </Modal>
  );
}
