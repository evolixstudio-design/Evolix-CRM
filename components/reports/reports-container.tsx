"use client";

import { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FounderReportsView } from "./founder-reports-view";
import { OperationalReportsView } from "./operational-reports-view";
import { InternReportsView } from "./intern-reports-view";
import { ActivityLogView } from "./activity-log-view";
import { CoFounderReportsData, InternReportsData } from "@/lib/services/report.service";
import { FileText, RefreshCw, BarChart2, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsContainerProps {
  userRole: string;
}

export function ReportsContainer({ userRole }: ReportsContainerProps) {
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<CoFounderReportsData | InternReportsData | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) {
        throw new Error("Failed to fetch reports data.");
      }
      const json = await res.json();
      if (json.success) {
        setReportsData(json.data);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading reports.");
    } finally {
      setLoading(false);
    }
  };

  const tabs =
    userRole === "CO_FOUNDER"
      ? [
          { id: "business", label: "Business Analytics" },
          { id: "operational", label: "Operational Performance" },
          { id: "activity", label: "Global Activity Log" },
        ]
      : [];

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Reports & Activity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {userRole === "CO_FOUNDER"
              ? "Comprehensive agency metrics, operational analytics, and system audit logs."
              : "Personal operational stats, completed assignments, and task fulfillment rates."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={userRole === "CO_FOUNDER" ? "default" : "info"} className="px-3 py-1 font-semibold text-xs">
            {userRole === "CO_FOUNDER" ? "CO-FOUNDER FULL ACCESS" : "INTERN OPERATIONAL PERFOMANCE"}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="h-9">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* CO-FOUNDER TABS */}
      {userRole === "CO_FOUNDER" && (
        <div className="flex justify-start">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* CONTENT VIEWS */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Aggregating real-time database report metrics...</span>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-xs text-rose-500 font-medium bg-rose-50 rounded-xl p-6 border border-rose-100">
          {error}
        </div>
      ) : userRole === "CO_FOUNDER" ? (
        <>
          {activeTab === "business" && <FounderReportsView data={reportsData as CoFounderReportsData} />}
          {activeTab === "operational" && <OperationalReportsView data={reportsData as CoFounderReportsData} />}
          {activeTab === "activity" && <ActivityLogView />}
        </>
      ) : (
        <InternReportsView data={reportsData as InternReportsData} />
      )}
    </div>
  );
}
