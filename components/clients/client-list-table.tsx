"use client";

import * as React from "react";
import { Eye, Edit2, Trash2, Building, Mail, Phone, ExternalLink } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientItem } from "@/types/client";
import { ClientStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

export interface ClientListTableProps {
  clients: ClientItem[];
  userRole?: string;
  onViewProfile: (client: ClientItem) => void;
  onEditClient: (client: ClientItem) => void;
  onDeleteClient?: (client: ClientItem) => void;
}

export function ClientListTable({
  clients,
  userRole = "CO_FOUNDER",
  onViewProfile,
  onEditClient,
  onDeleteClient,
}: ClientListTableProps) {
  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>;
      case "ONBOARDING":
        return <Badge variant="info">ONBOARDING</Badge>;
      case "ON_HOLD":
        return <Badge variant="warning">ON HOLD</Badge>;
      case "COMPLETED":
        return <Badge variant="default">COMPLETED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client & Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Team Leader & Intern</TableHead>
          <TableHead>Onboarding Status</TableHead>
          {userRole === "CO_FOUNDER" && <TableHead>Paid Total</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <button
                  onClick={() => onViewProfile(client)}
                  className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left"
                >
                  {client.name}
                </button>
                {client.companyName && (
                  <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                    <Building className="h-3 w-3 mr-1 text-slate-400" />
                    {client.companyName}
                  </p>
                )}
              </div>
            </TableCell>

            <TableCell>{getStatusBadge(client.status)}</TableCell>

            <TableCell>
              <span className="text-xs font-medium text-slate-600">
                {client.industry || "—"}
              </span>
            </TableCell>

            <TableCell>
              <div className="space-y-0.5 text-xs">
                {client.email && (
                  <p className="text-slate-600 flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-slate-400" />
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-slate-500 flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-slate-400" />
                    {client.phone}
                  </p>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-1">
                {client.assignedTo ? (
                  <div className="flex items-center space-x-1.5" title={`Team Leader: ${client.assignedTo.name}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">TL</span>
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[110px]">
                      {client.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic block">No TL</span>
                )}
                {client.assignedIntern && (
                  <div className="flex items-center space-x-1.5" title={`Intern: ${client.assignedIntern.name}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">Intern</span>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[110px]">
                      {client.assignedIntern.name}
                    </span>
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              {client.onboarding ? (
                <Badge variant="outline" className="text-[10px]">
                  {client.onboarding.status.replace("_", " ")}
                </Badge>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </TableCell>

            {userRole === "CO_FOUNDER" && (
              <TableCell className="font-semibold text-slate-900">
                {client.financials ? formatCurrency(client.financials.totalPayments) : "—"}
              </TableCell>
            )}

            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewProfile(client)}
                  title="View Client Profile"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditClient(client)}
                  title="Edit Client"
                >
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
                {userRole === "CO_FOUNDER" && onDeleteClient && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClient(client)}
                    title="Delete Client"
                    className="hover:bg-rose-50 text-rose-500 hover:text-rose-700"
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
