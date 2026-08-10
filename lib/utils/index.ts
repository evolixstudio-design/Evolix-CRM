import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = "INR"
): string {
  if (amount === null || amount === undefined) return "₹0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  const locale = currencyCode === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(num);
}

export function normalizePhoneNumber(
  phone: string | null | undefined,
  defaultDialCode: string = "+91"
): string {
  if (!phone || !phone.trim()) return "";
  const clean = phone.trim();
  if (clean.startsWith("+")) return clean;
  return `${defaultDialCode} ${clean}`;
}
