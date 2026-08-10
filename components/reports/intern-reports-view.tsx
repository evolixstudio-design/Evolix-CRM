"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InternReportsData } from "@/lib/services/report.service";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  Target,
  BarChart2,
  ShieldAlert,
} from "lucide-react";

interface InternReportsViewProps {
  data: InternReportsData;
}

export function InternReportsView({ data }: InternReportsViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. PERSONAL STATS HEADER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              My Operational Performance
            </h2>
            <p className="text-xs text-slate-500">Track your completed work, task deadlines, and operational efficiency</p>
          </div>
          <Badge variant="info" className="text-xs">
            Intern Operational Workspace
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-emerald-50/60 border-emerald-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">My Completed Tasks</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.completedTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Finished assignments</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-amber-50/60 border-amber-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">My Pending Tasks</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.pendingTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">In progress & review</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-rose-50/60 border-rose-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">My Overdue Tasks</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.overdueTasks}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Past target due date</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-indigo-50/60 border-indigo-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">My Completion Rate</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.completionRate}%</h3>
                <p className="text-[11px] text-slate-500 mt-1">Overall completion ratio</p>
              </div>
              <BarChart2 className="w-8 h-8 text-indigo-500 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-purple-50/60 border-purple-100 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">On-Time Fulfillment</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.onTimeCompletionRate}%</h3>
                <p className="text-[11px] text-slate-500 mt-1">Completed before deadline</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500 opacity-80" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. ASSIGNED PROJECTS OPERATIONAL OVERVIEW */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            My Assigned Projects
          </h2>
          <p className="text-xs text-slate-500">Projects where you are an active member or task assignee</p>
        </div>

        {data.assignedProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Projects Assigned Yet</p>
              <p className="text-xs text-slate-500">You will see your assigned projects and task counts here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.assignedProjects.map((p) => {
              const progress = p.totalTasksCount > 0 ? Math.round((p.completedTasksCount / p.totalTasksCount) * 100) : 0;
              return (
                <Card key={p.id} className="hover:border-slate-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-1">{p.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {p.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-500">
                      Service: {p.serviceType.replace(/_/g, " ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>My Assigned Tasks</span>
                      <span className="font-bold text-slate-900">
                        {p.completedTasksCount} / {p.totalTasksCount}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-right text-slate-400">{progress}% complete</p>
                    </div>

                    {p.deadline && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
