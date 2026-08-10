"use client";

import * as React from "react";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Users,
  Bell,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InternDashboardData } from "@/types/dashboard";
import { formatDate } from "@/lib/utils";

export interface InternDashboardProps {
  data: InternDashboardData;
}

export function InternDashboard({ data }: InternDashboardProps) {
  const { operational, notifications } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal task tracking, assigned projects, and client deadlines.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">INTERN View</Badge>
        </div>
      </div>

      {/* 1. My Work KPI Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          My Operational Tasks
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Pending Tasks</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {operational.pendingTasksCount}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Total assigned tasks</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                  <CheckSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Due Today</p>
                  <h3 className="text-2xl font-bold text-amber-900 mt-1">
                    {operational.todaysTasksCount}
                  </h3>
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">Requires attention</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Overdue Tasks</p>
                  <h3 className="text-2xl font-bold text-rose-900 mt-1">
                    {operational.overdueTasksCount}
                  </h3>
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">Action required</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Completed</p>
                  <h3 className="text-2xl font-bold text-emerald-900 mt-1">
                    {operational.completedTasksCount}
                  </h3>
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">Finished work</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. My Progress */}
      <Card className="border-slate-100 bg-white">
        <CardHeader>
          <CardTitle>Overall Task Progress</CardTitle>
          <CardDescription>Completion percentage across all assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Task Completion Rate
            </span>
            <span className="text-sm font-bold text-teal-600">
              {operational.taskProgressPercentage}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${operational.taskProgressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. My Projects & My Clients */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-100">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FolderKanban className="h-5 w-5 text-indigo-600" />
              <CardTitle>Assigned Projects</CardTitle>
            </div>
            <CardDescription>Projects you are currently participating in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {operational.myProjectsCount}
              </span>
              <span className="text-xs text-slate-500">Active assigned projects</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-sky-600" />
              <CardTitle>Assigned Clients</CardTitle>
            </div>
            <CardDescription>Client accounts associated with your projects/tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {operational.myClientsCount}
              </span>
              <span className="text-xs text-slate-500">Associated clients</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Personal Notifications Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Recent Notifications
          </h2>
        </div>

        <Card className="border-slate-100">
          <CardContent className="p-0 divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start space-x-3 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="rounded-full bg-teal-50 p-2 text-teal-600 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <Badge variant="success" className="text-[9px]">New</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No recent notifications.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
