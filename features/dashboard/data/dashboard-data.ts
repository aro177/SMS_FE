import type { HeroAction, SummaryMetric } from "../types";

export const summaryMetrics: SummaryMetric[] = [
  { label: "Active students", value: "248", trend: "+12 this month" },
  { label: "Open classes", value: "18", trend: "4 need schedules" },
  { label: "Teachers", value: "26", trend: "2 onboarding" },
  { label: "Attendance today", value: "94%", trend: "+3% vs yesterday" },
];

export const heroActions: HeroAction[] = [
  { label: "Add student", href: "#students", tone: "primary" },
  { label: "View classes", href: "#classes", tone: "secondary" },
];
