"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoFounderReportsData } from "@/lib/services/report.service";
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  PieChart,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface FounderReportsViewProps {
  data: CoFounderReportsData;
}

export function FounderReportsView({ data }: FounderReportsViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* 1. FINANCIAL SUMMARY HIGHLIGHTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              Financial & Revenue Performance
            </h2>
            <p className="text-xs text-slate-500">Business revenue, total expenses, and profit margin analysis</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Co-Founder Exclusive
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.financials.revenue)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Paid payments sum</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.financials.pendingPayments)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Pending client payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.financials.expenses)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">All recorded operational expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Net Profit</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.financials.profit)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Revenue minus expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Profit Margin</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.financials.profitMargin}%</h3>
              <p className="text-[11px] text-slate-500 mt-1">Net profit ratio</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. SALES & LEAD CONVERSION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Lead Conversion & Sales Pipeline
            </h2>
            <p className="text-xs text-slate-500">Lead acquisition rates, status breakdown, and source channels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Sales Metrics</CardTitle>
              <CardDescription className="text-xs">Overall lead conversions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-medium text-slate-600">Total Leads</span>
                <span className="text-sm font-bold text-slate-900">{data.sales.totalLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-xs font-medium text-emerald-800">Won Deals</span>
                <span className="text-sm font-bold text-emerald-900">{data.sales.wonLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <span className="text-xs font-medium text-rose-800">Lost Deals</span>
                <span className="text-sm font-bold text-rose-900">{data.sales.lostLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-xs font-medium text-indigo-800">Conversion Rate</span>
                <span className="text-sm font-bold text-indigo-900">{data.sales.conversionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-xs font-medium text-amber-800">Est. Pipeline Value</span>
                <span className="text-sm font-bold text-amber-900">{formatCurrency(data.sales.estimatedPipelineValue)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Leads by Status</CardTitle>
              <CardDescription className="text-xs">Distribution in pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(data.sales.byStatus).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No lead status data available</p>
              ) : (
                Object.entries(data.sales.byStatus).map(([status, count]) => {
                  const pct = data.sales.totalLeads > 0 ? Math.round((count / data.sales.totalLeads) * 100) : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{status}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Lead Acquisition Sources</CardTitle>
              <CardDescription className="text-xs">Top performing lead channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(data.sales.bySource).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No lead source data available</p>
              ) : (
                Object.entries(data.sales.bySource).map(([source, count]) => {
                  const pct = data.sales.totalLeads > 0 ? Math.round((count / data.sales.totalLeads) * 100) : 0;
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{source.replace(/_/g, " ")}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. CLIENT & PROJECT METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Client Growth & Distribution
            </CardTitle>
            <CardDescription className="text-xs">Client onboarding and active counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">Total Clients</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{data.clients.totalClients}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[11px] text-emerald-700 font-medium">Active</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">{data.clients.activeClients}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[11px] text-amber-700 font-medium">Onboarding</p>
                <p className="text-xl font-bold text-amber-900 mt-1">{data.clients.onboardingClients}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-700 font-medium">New This Month</p>
                <p className="text-xl font-bold text-blue-900 mt-1">+{data.clients.newClientsThisMonth}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-700">Client Status Breakdown</h4>
              {Object.entries(data.clients.byStatus).map(([status, count]) => {
                const pct = data.clients.totalClients > 0 ? Math.round((count / data.clients.totalClients) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{status}</span>
                      <span className="text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Project Completion & Deliverables
            </CardTitle>
            <CardDescription className="text-xs">Active and completed project health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">Total Projects</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{data.projects.totalProjects}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[11px] text-indigo-700 font-medium">Active</p>
                <p className="text-xl font-bold text-indigo-900 mt-1">{data.projects.activeProjects}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[11px] text-emerald-700 font-medium">Completed</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">{data.projects.completedProjects}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[11px] text-rose-700 font-medium">Overdue</p>
                <p className="text-xl font-bold text-rose-900 mt-1">{data.projects.overdueProjects}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Project Completion Rate</span>
                <span className="font-bold text-indigo-600">{data.projects.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${data.projects.completionRate}%` }} />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-slate-700">Services Breakdown</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(data.projects.byServiceType).slice(0, 6).map(([svc, count]) => (
                  <div key={svc} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 truncate">{svc.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
