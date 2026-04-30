import { differenceInDays, format, parseISO } from "date-fns";
import type { PlayerStatus } from "./types";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM/yyyy");
}

export interface PlayerStatusInfo {
  status: PlayerStatus;
  daysLeft: number;
}

export function getPlayerStatus(endDate: string): PlayerStatusInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = parseISO(endDate);
  const daysLeft = differenceInDays(end, today);

  if (daysLeft < 0) return { status: "expired", daysLeft };
  if (daysLeft <= 7) return { status: "expiring", daysLeft };
  return { status: "active", daysLeft };
}

export const SUBSCRIPTION_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly (3M)",
  semi_annual: "Semi-Annual (6M)",
  annual: "Annual (12M)",
};

export const GYM_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};
