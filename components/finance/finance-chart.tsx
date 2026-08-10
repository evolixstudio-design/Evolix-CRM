"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FinanceChartPoint } from "@/types/finance";
import { formatCurrency } from "@/lib/utils";

export interface FinanceChartProps {
  chartData: FinanceChartPoint[];
}

export function FinanceChart({ chartData }: FinanceChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="border-slate-100 bg-white p-6 text-center">
        <p className="text-xs text-slate-400 italic">No financial trend data available yet.</p>
      </Card>
    );
  }

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.revenue, d.expenses, d.profit)),
    1000
  );

  return (
    <Card className="border-slate-100 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900">
            Financial Trends & Cash Flow
          </CardTitle>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 font-medium">Revenue</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600 font-medium">Expenses</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 rounded-sm bg-teal-600" />
              <span className="text-slate-600 font-medium">Net Profit</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-4">
          {chartData.map((pt) => {
            const revPct = Math.min(100, Math.max(2, Math.round((pt.revenue / maxVal) * 100)));
            const expPct = Math.min(100, Math.max(2, Math.round((pt.expenses / maxVal) * 100)));
            const prfPct = Math.min(100, Math.max(2, Math.round((Math.max(0, pt.profit) / maxVal) * 100)));

            return (
              <div key={pt.month} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>{pt.month}</span>
                  <div className="flex space-x-3 text-[11px]">
                    <span className="text-emerald-600">Rev: {formatCurrency(pt.revenue)}</span>
                    <span className="text-rose-600">Exp: {formatCurrency(pt.expenses)}</span>
                    <span className="text-teal-700">Prof: {formatCurrency(pt.profit)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Revenue Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${revPct}%` }}
                    />
                  </div>
                  {/* Expenses Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${expPct}%` }}
                    />
                  </div>
                  {/* Profit Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${prfPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
