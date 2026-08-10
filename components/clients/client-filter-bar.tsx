"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClientStatus } from "@prisma/client";

export interface ClientFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
}

export function ClientFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onResetFilters,
}: ClientFilterBarProps) {
  const hasActiveFilters = search || status;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by client name, company, email, industry..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="w-44">
          <Select
            placeholder="All Client Statuses"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { label: "Onboarding", value: ClientStatus.ONBOARDING },
              { label: "Active", value: ClientStatus.ACTIVE },
              { label: "On Hold", value: ClientStatus.ON_HOLD },
              { label: "Completed", value: ClientStatus.COMPLETED },
              { label: "Inactive", value: ClientStatus.INACTIVE },
              { label: "Archived", value: ClientStatus.ARCHIVED },
            ]}
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
