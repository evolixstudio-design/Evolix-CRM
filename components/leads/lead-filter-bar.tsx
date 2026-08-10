"use client";

import * as React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LeadStatus, LeadPriority } from "@prisma/client";
import { LEAD_SOURCE_OPTIONS } from "@/lib/lead-source-utils";

export interface LeadFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  onResetFilters: () => void;
}

export function LeadFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  source,
  onSourceChange,
  onResetFilters,
}: LeadFilterBarProps) {
  const hasActiveFilters = search || status || priority || source;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, company, email, phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-36">
          <Select
            placeholder="All Statuses"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { label: "New", value: LeadStatus.NEW },
              { label: "Contacted", value: LeadStatus.CONTACTED },
              { label: "Qualified", value: LeadStatus.QUALIFIED },
              { label: "Meeting", value: LeadStatus.MEETING },
              { label: "Proposal Sent", value: LeadStatus.PROPOSAL_SENT },
              { label: "Negotiation", value: LeadStatus.NEGOTIATION },
              { label: "Won", value: LeadStatus.WON },
              { label: "Lost", value: LeadStatus.LOST },
            ]}
            className="h-10 text-xs"
          />
        </div>

        <div className="w-32">
          <Select
            placeholder="All Priorities"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            options={[
              { label: "Low", value: LeadPriority.LOW },
              { label: "Medium", value: LeadPriority.MEDIUM },
              { label: "High", value: LeadPriority.HIGH },
              { label: "Urgent", value: LeadPriority.URGENT },
            ]}
            className="h-10 text-xs"
          />
        </div>

        <div className="w-36">
          <Select
            placeholder="All Sources"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            options={LEAD_SOURCE_OPTIONS}
            className="h-10 text-xs"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
