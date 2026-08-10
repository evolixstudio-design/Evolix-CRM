"use client";

import * as React from "react";
import { Handshake, Calendar, Edit2, CheckCircle2, Clock, FileText, Briefcase, Tag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OnboardingItem } from "@/types/client";
import { formatDate } from "@/lib/utils";
import { OnboardingStatus } from "@prisma/client";

export interface OnboardingCardGridProps {
  onboardings: OnboardingItem[];
  onEditOnboarding: (onboarding: OnboardingItem) => void;
}

export function OnboardingCardGrid({
  onboardings,
  onEditOnboarding,
}: OnboardingCardGridProps) {
  const getStatusBadge = (status: OnboardingStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">COMPLETED</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "WAITING_FOR_CLIENT":
        return <Badge variant="warning">WAITING FOR CLIENT</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="default">NOT STARTED</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {onboardings.map((ob) => (
        <Card key={ob.id} className="border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {ob.clientName}
                </CardTitle>
                {ob.clientCompanyName && (
                  <CardDescription className="text-xs text-slate-500 font-medium">
                    {ob.clientCompanyName}
                  </CardDescription>
                )}
              </div>
              {getStatusBadge(ob.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0 text-xs">
            {/* Services & Business Info Badges */}
            {ob.services && (
              <div className="flex items-center text-teal-700 font-semibold bg-teal-50/70 p-2 rounded-lg border border-teal-100">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{ob.services}</span>
              </div>
            )}

            {ob.dealInfo && (
              <div className="flex items-center text-slate-700 font-medium">
                <Tag className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
                <span className="truncate">{ob.dealInfo}</span>
              </div>
            )}

            {ob.businessInfo && (
              <p className="text-slate-500 text-[11px]">
                <strong className="text-slate-700">Business:</strong> {ob.businessInfo}
              </p>
            )}

            <div className="flex items-center justify-between text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Start: {formatDate(ob.startDate)}
              </span>
              {ob.targetEndDate ? (
                <span className="text-indigo-600 font-medium">
                  Target: {formatDate(ob.targetEndDate)}
                </span>
              ) : ob.completedAt ? (
                <span className="text-emerald-600 font-medium">
                  Done: {formatDate(ob.completedAt)}
                </span>
              ) : null}
            </div>

            {ob.notes ? (
              <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600 italic border border-slate-100 line-clamp-2">
                &ldquo;{ob.notes}&rdquo;
              </div>
            ) : (
              <p className="text-slate-400 italic">No workflow notes added yet.</p>
            )}

            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditOnboarding(ob)}
                className="text-xs"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                Update Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
