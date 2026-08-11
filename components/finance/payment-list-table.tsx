"use client";

import * as React from "react";
import { Edit2, FolderKanban, Calendar, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentItem } from "@/types/finance";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";

export interface PaymentListTableProps {
  payments: PaymentItem[];
  onEditPayment: (payment: PaymentItem) => void;
  onDeletePayment?: (payment: PaymentItem) => void;
}

export function PaymentListTable({ payments, onEditPayment, onDeletePayment }: PaymentListTableProps) {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">PAID</Badge>;
      case "PENDING":
        return <Badge variant="warning">PENDING</Badge>;
      case "FAILED":
        return <Badge variant="destructive">FAILED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client & Reference</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <span className="font-bold text-slate-900 block">{p.client.name}</span>
                {p.reference && (
                  <span className="text-xs text-slate-400 font-mono">Ref: {p.reference}</span>
                )}
              </div>
            </TableCell>

            <TableCell>{getStatusBadge(p.status)}</TableCell>

            <TableCell className="font-extrabold text-slate-900">
              {formatCurrency(p.amount)}
            </TableCell>

            <TableCell>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                {p.method.replace("_", " ")}
              </span>
            </TableCell>

            <TableCell>
              {p.project ? (
                <span className="text-xs font-semibold text-slate-700 flex items-center">
                  <FolderKanban className="h-3 w-3 mr-1 text-slate-400" />
                  {p.project.name}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">—</span>
              )}
            </TableCell>

            <TableCell>
              <span className="text-xs text-slate-600 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {formatDate(p.paymentDate)}
              </span>
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditPayment(p)}
                  title="Edit Payment"
                >
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
                {onDeletePayment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeletePayment(p)}
                    title="Delete Payment"
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

