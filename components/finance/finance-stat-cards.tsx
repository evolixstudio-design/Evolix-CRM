"use client";

import * as React from "react";
import { IndianRupee, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FinanceSummary } from "@/types/finance";

export interface FinanceStatCardsProps {
  summary: FinanceSummary;
}

export function FinanceStatCards({ summary }: FinanceStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Paid Revenue */}
      <Card className="border-slate-100 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Paid Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalPaidRevenue)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed client payments</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="border-slate-100 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Operational & project costs</p>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="border-slate-100 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Profit
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${summary.netProfit >= 0 ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-teal-600" : "text-rose-600"}`}>
              {formatCurrency(summary.netProfit)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Paid Revenue − Expenses</p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card className="border-slate-100 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending / Overdue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalPendingPayments)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Outstanding receivables</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
