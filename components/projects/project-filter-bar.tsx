"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProjectStatus, ProjectPriority, ProjectServiceType } from "@prisma/client";

export interface ProjectFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  serviceType: string;
  onServiceTypeChange: (value: string) => void;
  onResetFilters: () => void;
}

export function ProjectFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  serviceType,
  onServiceTypeChange,
  onResetFilters,
}: ProjectFilterBarProps) {
  const hasActiveFilters = search || status || priority || serviceType;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by project name, description, client..."
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
              { label: "Planning", value: ProjectStatus.PLANNING },
              { label: "In Progress", value: ProjectStatus.IN_PROGRESS },
              { label: "On Hold", value: ProjectStatus.ON_HOLD },
              { label: "Completed", value: ProjectStatus.COMPLETED },
              { label: "Cancelled", value: ProjectStatus.CANCELLED },
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
              { label: "Low", value: ProjectPriority.LOW },
              { label: "Medium", value: ProjectPriority.MEDIUM },
              { label: "High", value: ProjectPriority.HIGH },
              { label: "Urgent", value: ProjectPriority.URGENT },
            ]}
            className="h-10 text-xs"
          />
        </div>

        <div className="w-36">
          <Select
            placeholder="All Services"
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            options={[
              { label: "Website", value: ProjectServiceType.WEBSITE },
              { label: "Software", value: ProjectServiceType.SOFTWARE },
              { label: "Branding", value: ProjectServiceType.BRANDING },
              { label: "Social Media", value: ProjectServiceType.SOCIAL_MEDIA },
              { label: "Digital Marketing", value: ProjectServiceType.DIGITAL_MARKETING },
              { label: "SEO", value: ProjectServiceType.SEO },
              { label: "3D Animation", value: ProjectServiceType.THREE_D_ANIMATION },
              { label: "E-Commerce", value: ProjectServiceType.ECOMMERCE },
              { label: "AI Automation", value: ProjectServiceType.AI_AUTOMATION },
              { label: "Other", value: ProjectServiceType.OTHER },
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
