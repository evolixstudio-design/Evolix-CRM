"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoFounderReportsData } from "@/lib/services/report.service";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Briefcase,
  Layers,
  BarChart3,
} from "lucide-react";

interface OperationalReportsViewProps {
  data: CoFounderReportsData;
}

export function OperationalReportsView({ data }: OperationalReportsViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. OVERALL OPERATIONAL STATS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Operational Task & Project Health
          </h2>
          <p className="text-xs text-slate-500">Live operational metrics, task completion rates, and active workloads</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Tasks Completed</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.tasks.completedTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Total finished tasks</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Tasks Pending</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.tasks.pendingTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">In progress & review</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-rose-50/50 border-rose-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Overdue Tasks</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.tasks.overdueTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Past target due date</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Completion Rate</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.tasks.completionRate}%</h3>
                <p className="text-[11px] text-slate-500 mt-1">Task fulfillment ratio</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Project Progress</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.projects.completionRate}%</h3>
                <p className="text-[11px] text-slate-500 mt-1">Overall project completion</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500 opacity-80" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. TEAM WORKLOAD BREAKDOWN */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Team Workload & Operational Capacity
          </h2>
          <p className="text-xs text-slate-500">Task distribution and efficiency breakdown per team member</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Active Member Capacity</CardTitle>
            <CardDescription className="text-xs">Individual task assignment and fulfillment rates</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Team Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Assigned Projects</th>
                  <th className="px-4 py-3 text-center">Total Tasks</th>
                  <th className="px-4 py-3 text-center text-emerald-700">Completed</th>
                  <th className="px-4 py-3 text-center text-amber-700">Pending</th>
                  <th className="px-4 py-3 text-center text-rose-700">Overdue</th>
                  <th className="px-4 py-3 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.teamWorkload.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-slate-400">
                      No team workload records available
                    </td>
                  </tr>
                ) : (
                  data.teamWorkload.map((m) => (
                    <tr key={m.userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {m.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{m.userName}</p>
                            <p className="text-[10px] text-slate-400">{m.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={m.role === "CO_FOUNDER" ? "default" : "info"} className="text-[10px] px-2 py-0.5">
                          {m.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{m.assignedProjectsCount}</td>
                      <td className="px-4 py-3 text-center font-semibold">{m.totalAssignedTasks}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{m.completedTasks}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">{m.pendingTasks}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">
                        {m.overdueTasks > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[11px]">
                            {m.overdueTasks}
                          </span>
                        ) : (
                          0
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-900">{m.completionRate}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${m.completionRate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
