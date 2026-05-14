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

const EXERCISE_BADGE_PALETTE = [
  "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20",
  "bg-warning/10 text-warning border-warning/20",
  "bg-success/10 text-success border-success/20",
  "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20",
  "bg-[#F472B6]/10 text-[#F472B6] border-[#F472B6]/20",
];

export function exerciseTypeBadgeClass(typeName: string): string {
  let hash = 0;
  for (let i = 0; i < typeName.length; i++) {
    hash = (hash * 31 + typeName.charCodeAt(i)) & 0xffff;
  }
  return EXERCISE_BADGE_PALETTE[hash % EXERCISE_BADGE_PALETTE.length];
}
