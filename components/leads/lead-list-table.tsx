"use client";

import * as React from "react";
import { Eye, Edit2, ArrowRightLeft, User, Calendar, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadItem } from "@/types/lead";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { getSourceConfig } from "@/lib/lead-source-utils";

export interface LeadListTableProps {
  leads: LeadItem[];
  onViewDetails: (lead: LeadItem) => void;
  onEditLead: (lead: LeadItem) => void;
  onConvertLead: (lead: LeadItem) => void;
  onDeleteLead?: (lead: LeadItem) => void;
}

export function LeadListTable({
  leads,
  onViewDetails,
  onEditLead,
  onConvertLead,
  onDeleteLead,
}: LeadListTableProps) {
  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "WON":
        return <Badge variant="success">WON</Badge>;
      case "LOST":
        return <Badge variant="destructive">LOST</Badge>;
      case "NEW":
        return <Badge variant="default">NEW</Badge>;
      case "NEGOTIATION":
      case "PROPOSAL_SENT":
        return <Badge variant="warning">{status.replace("_", " ")}</Badge>;
      default:
        return <Badge variant="info">{status.replace("_", " ")}</Badge>;
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
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
          <TableHead>Lead & Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Est. Value</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Assigned Founder</TableHead>
          <TableHead>Next Follow-up</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <button
                  onClick={() => onViewDetails(lead)}
                  className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left"
                >
                  {lead.name}
                </button>
                {lead.companyName && (
                  <p className="text-xs text-slate-500 font-medium">{lead.companyName}</p>
                )}
                {lead.email && <p className="text-[11px] text-slate-400">{lead.email}</p>}
              </div>
            </TableCell>

            <TableCell>{getStatusBadge(lead.status)}</TableCell>

            <TableCell>{getPriorityBadge(lead.priority)}</TableCell>

            <TableCell className="font-semibold text-slate-900">
              {formatCurrency(lead.estimatedValue)}
            </TableCell>

            <TableCell>
              {(() => {
                const cfg = getSourceConfig(lead.source);
                return (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })()}
            </TableCell>

            <TableCell>
              {lead.assignedTo ? (
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                    {lead.assignedTo.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                    {lead.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Unassigned</span>
              )}
            </TableCell>

            <TableCell>
              {lead.nextFollowUpAt ? (
                <div className="flex items-center space-x-1 text-xs text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDate(lead.nextFollowUpAt)}</span>
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
                  onClick={() => onViewDetails(lead)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditLead(lead)}
                  title="Edit Lead"
                >
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
                {onDeleteLead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteLead(lead)}
                    title="Delete Lead"
                    className="hover:bg-rose-50 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {lead.convertedClient ? (
                  <Badge variant="success" className="text-[10px] ml-1">
                    Client
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConvertLead(lead)}
                    className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 ml-1 font-semibold"
                    title="Convert Lead to Client"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                    {lead.status === "WON" ? "CONVERT TO CLIENT" : "Convert"}
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

