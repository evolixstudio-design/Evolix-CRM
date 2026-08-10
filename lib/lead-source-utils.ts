import { LeadSource } from "@prisma/client";

/**
 * Lead Source display configuration
 * Centralizes labels, colors, and emoji icons for all lead sources.
 */

export interface LeadSourceConfig {
  label: string;
  emoji: string;
  /** Tailwind classes for the source badge pill */
  badgeClass: string;
  /** Tailwind classes for the small dot indicator */
  dotClass: string;
}

export const LEAD_SOURCE_CONFIG: Record<LeadSource, LeadSourceConfig> = {
  [LeadSource.INSTAGRAM]: {
    label: "Instagram",
    emoji: "📸",
    badgeClass: "bg-gradient-to-r from-fuchsia-50 to-pink-50 text-fuchsia-700 border-fuchsia-200",
    dotClass: "bg-fuchsia-500",
  },
  [LeadSource.FACEBOOK]: {
    label: "Facebook",
    emoji: "📘",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-600",
  },
  [LeadSource.LINKEDIN]: {
    label: "LinkedIn",
    emoji: "💼",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    dotClass: "bg-sky-600",
  },
  [LeadSource.WHATSAPP]: {
    label: "WhatsApp",
    emoji: "💬",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  [LeadSource.WEBSITE]: {
    label: "Website",
    emoji: "🌐",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    dotClass: "bg-violet-500",
  },
  [LeadSource.REFERRAL]: {
    label: "Referral",
    emoji: "🤝",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  [LeadSource.UPWORK]: {
    label: "Upwork",
    emoji: "🟢",
    badgeClass: "bg-lime-50 text-lime-700 border-lime-200",
    dotClass: "bg-lime-600",
  },
  [LeadSource.FIVERR]: {
    label: "Fiverr",
    emoji: "🎯",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-500",
  },
  [LeadSource.FREELANCER]: {
    label: "Freelancer",
    emoji: "🛠️",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dotClass: "bg-cyan-500",
  },
  [LeadSource.COLD_OUTREACH]: {
    label: "Cold Outreach",
    emoji: "📨",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotClass: "bg-indigo-500",
  },
  [LeadSource.GOOGLE]: {
    label: "Google",
    emoji: "🔍",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-500",
  },
  [LeadSource.COLD_CALL]: {
    label: "Cold Call",
    emoji: "📞",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    dotClass: "bg-orange-500",
  },
  [LeadSource.EMAIL]: {
    label: "Email",
    emoji: "✉️",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    dotClass: "bg-teal-500",
  },
  [LeadSource.EXISTING_CLIENT]: {
    label: "Existing Client",
    emoji: "⭐",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  [LeadSource.WALK_IN]: {
    label: "Walk-in",
    emoji: "🚶",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
    dotClass: "bg-stone-500",
  },
  [LeadSource.OTHER]: {
    label: "Other",
    emoji: "📋",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  },
};

/**
 * Get a human-readable label for a LeadSource enum value.
 */
export function getSourceLabel(source: LeadSource): string {
  return LEAD_SOURCE_CONFIG[source]?.label ?? source;
}

/**
 * Get the full config for a LeadSource enum value.
 */
export function getSourceConfig(source: LeadSource): LeadSourceConfig {
  return (
    LEAD_SOURCE_CONFIG[source] ?? {
      label: source,
      emoji: "📋",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    }
  );
}

/**
 * Sorted source options for Select dropdowns — grouped by category.
 */
export const LEAD_SOURCE_OPTIONS = [
  // Social & Messaging
  { label: "📸  Instagram", value: LeadSource.INSTAGRAM },
  { label: "📘  Facebook", value: LeadSource.FACEBOOK },
  { label: "💼  LinkedIn", value: LeadSource.LINKEDIN },
  { label: "💬  WhatsApp", value: LeadSource.WHATSAPP },
  // Digital
  { label: "🌐  Website", value: LeadSource.WEBSITE },
  { label: "🔍  Google", value: LeadSource.GOOGLE },
  { label: "✉️  Email", value: LeadSource.EMAIL },
  // Freelance Platforms
  { label: "🟢  Upwork", value: LeadSource.UPWORK },
  { label: "🎯  Fiverr", value: LeadSource.FIVERR },
  { label: "🛠️  Freelancer", value: LeadSource.FREELANCER },
  // Outbound
  { label: "📞  Cold Call", value: LeadSource.COLD_CALL },
  { label: "📨  Cold Outreach", value: LeadSource.COLD_OUTREACH },
  // Relationship
  { label: "🤝  Referral", value: LeadSource.REFERRAL },
  { label: "⭐  Existing Client", value: LeadSource.EXISTING_CLIENT },
  { label: "🚶  Walk-in", value: LeadSource.WALK_IN },
  // Catch-all
  { label: "📋  Other", value: LeadSource.OTHER },
];
