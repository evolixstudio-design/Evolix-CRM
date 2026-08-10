"use client";

import * as React from "react";
import { Edit2, Building, FolderKanban, Calendar } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "@/types/finance";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ExpenseListTableProps {
  expenses: ExpenseItem[];
  onEditExpense: (expense: ExpenseItem) => void;
}

export function ExpenseListTable({ expenses, onEditExpense }: ExpenseListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Expense Description & Vendor</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Project / Client</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((exp) => (
          <TableRow key={exp.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <span className="font-bold text-slate-900 block">{exp.description}</span>
                {exp.vendor && (
                  <span className="text-xs text-slate-500 font-medium">Vendor: {exp.vendor}</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <Badge variant="outline">{exp.category.replace("_", " ")}</Badge>
            </TableCell>

            <TableCell className="font-extrabold text-rose-600">
              {formatCurrency(exp.amount)}
            </TableCell>

            <TableCell>
              {exp.paymentMethod ? (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                  {exp.paymentMethod.replace("_", " ")}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">—</span>
              )}
            </TableCell>

            <TableCell>
              {exp.project ? (
                <span className="text-xs font-semibold text-slate-700 flex items-center">
                  <FolderKanban className="h-3 w-3 mr-1 text-slate-400" />
                  {exp.project.name}
                </span>
              ) : exp.client ? (
                <span className="text-xs font-semibold text-slate-700 flex items-center">
                  <Building className="h-3 w-3 mr-1 text-slate-400" />
                  {exp.client.name}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">—</span>
              )}
            </TableCell>

            <TableCell>
              <span className="text-xs text-slate-600 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {formatDate(exp.expenseDate)}
              </span>
            </TableCell>

            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditExpense(exp)}
                title="Edit Expense"
              >
                <Edit2 className="h-4 w-4 text-slate-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
