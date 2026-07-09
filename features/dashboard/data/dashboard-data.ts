import type { HeroAction, SummaryMetric } from "../types";

export const summaryMetrics: SummaryMetric[] = [
  { label: "Học viên đang học", value: "248", trend: "+12 trong tháng" },
  { label: "Lớp đang mở", value: "18", trend: "4 lớp cần xếp lịch" },
  { label: "Giáo viên", value: "26", trend: "2 giáo viên mới" },
  { label: "Điểm danh hôm nay", value: "94%", trend: "+3% so với hôm qua" },
];

export const heroActions: HeroAction[] = [
  { label: "Thêm học viên", href: "#students", tone: "primary" },
  { label: "Xem lớp học", href: "#classes", tone: "secondary" },
];
