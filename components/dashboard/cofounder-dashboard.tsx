"use client";

import * as React from "react";
import {
  Target,
  Users,
  FolderKanban,
  CheckSquare,
  IndianRupee,
  TrendingUp,
  CreditCard,
  Clock,
  AlertCircle,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { CoFounderDashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

export interface CoFounderDashboardProps {
  data: CoFounderDashboardData;
}

export function CoFounderDashboard({ data }: CoFounderDashboardProps) {
  const { business, finance, teamWorkload } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Agency Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business performance, financials, and team workload.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-slate-900 text-white">
            CO_FOUNDER View
          </Badge>
        </div>
      </div>

      {/* 1. Business Overview KPI Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Business Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Leads</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {business.totalLeads}
                  </h3>
                  <p className="text-[11px] text-teal-600 font-medium mt-1">
                    {business.newLeads} new leads
                  </p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Active Clients</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {business.activeClients}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Active client retainer accounts
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Active Projects</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {business.activeProjects}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Projects in progress
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <FolderKanban className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Pending Tasks</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {business.pendingTasks}
                  </h3>
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {business.overdueTasks} overdue
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <CheckSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Financial Overview Cards (STRICTLY CO-FOUNDER) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Financial Health
          </h2>
          <Badge variant="outline" className="text-[10px] text-slate-500">
            Real PostgreSQL Financial Records
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Total Revenue</p>
                  <h3 className="text-2xl font-black text-emerald-900 mt-1">
                    {formatCurrency(finance.revenue)}
                  </h3>
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                    Paid client payments
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <IndianRupee className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-800">Total Expenses</p>
                  <h3 className="text-2xl font-black text-rose-900 mt-1">
                    {formatCurrency(finance.expenses)}
                  </h3>
                  <p className="text-[10px] text-rose-600 mt-1 font-medium">
                    Recorded operational costs
                  </p>
                </div>
                <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-teal-800">Net Profit</p>
                  <h3 className="text-2xl font-black text-teal-950 mt-1">
                    {formatCurrency(finance.profit)}
                  </h3>
                  <p className="text-[10px] text-teal-600 mt-1 font-medium">
                    Revenue - Expenses
                  </p>
                </div>
                <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-800">Pending Payments</p>
                  <h3 className="text-2xl font-black text-amber-900 mt-1">
                    {formatCurrency(finance.pendingPayments)}
                  </h3>
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">
                    Outstanding receivables
                  </p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Lead Conversion & Overdue Alerts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-teal-600" />
              <CardTitle>Lead Conversion Performance</CardTitle>
            </div>
            <CardDescription>Percentage of acquired leads converted to clients</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold text-slate-900">
                {business.leadConversionRate}%
              </span>
              <span className="text-xs text-slate-500 font-medium">overall conversion rate</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(business.leadConversionRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <CardTitle>Operational Alerts</CardTitle>
            </div>
            <CardDescription>Attention items across agency projects and tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-rose-50/60 p-3">
              <span className="text-xs font-semibold text-rose-900">Overdue Deliverables</span>
              <Badge variant="destructive">{business.overdueTasks} Tasks</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-teal-50/60 p-3">
              <span className="text-xs font-semibold text-teal-900">New Inquiries</span>
              <Badge variant="success">{business.newLeads} Leads</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Team Workload Summary */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Team Workload
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active Tasks</TableHead>
              <TableHead>Overdue Tasks</TableHead>
              <TableHead>Active Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamWorkload.map((member) => (
              <TableRow key={member.userId}>
                <TableCell className="font-semibold text-slate-900 flex items-center space-x-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                    {member.name.charAt(0)}
                  </div>
                  <span>{member.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={member.role === "CO_FOUNDER" ? "default" : "info"}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">{member.activeTasks}</TableCell>
                <TableCell>
                  {member.overdueTasks > 0 ? (
                    <Badge variant="destructive">{member.overdueTasks}</Badge>
                  ) : (
                    <span className="text-slate-400 text-xs">0</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">{member.activeProjects}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
