import { GuestLandingPage } from "@/features/guest/components/GuestLandingPage";
import { demoChildResults, publicClasses } from "@/features/guest/data/guest-data";
import { classesService } from "@/features/classes/services/classes-service";
import type { Classroom } from "@/features/classes/types";
import type { PublicClass } from "@/features/guest/types";

export const dynamic = "force-dynamic";

export default async function GuestPage() {
  const classes = await loadPublicClasses();

  return <GuestLandingPage childResults={demoChildResults} classes={classes} />;
}

async function loadPublicClasses(): Promise<PublicClass[]> {
  try {
    const result = await classesService.getClasses();
    return result.items.length > 0 ? result.items.map(mapClassroomToPublicClass) : publicClasses;
  } catch {
    return publicClasses;
  }
}

function mapClassroomToPublicClass(classroom: Classroom, index: number): PublicClass {
  const subjectOptions: PublicClass["subject"][] = ["Yoga", "Thiền thở", "Vận động"];
  const ageOptions: { group: PublicClass["ageGroup"]; range: string }[] = [
    { group: "6-9", range: "6 - 9 tuổi" },
    { group: "8-12", range: "8 - 12 tuổi" },
    { group: "10-15", range: "10 - 15 tuổi" },
  ];
  const subject = subjectOptions[index % subjectOptions.length];
  const age = ageOptions[index % ageOptions.length];
  const priceValue = Number(classroom.tuitionFee);

  return {
    id: classroom.id,
    ageGroup: age.group,
    ageRange: age.range,
    description: "Lớp đang mở tại trung tâm, phù hợp để con rèn luyện sự tập trung và vận động nhẹ nhàng.",
    highlight: index === 0 ? "Bán chạy" : index % 2 === 0 ? "Lớp mới" : "Còn chỗ",
    name: classroom.name,
    priceTier: priceValue < 2_000_000 ? "under2m" : priceValue <= 2_500_000 ? "2mto25m" : "over25m",
    priceValue,
    schedule: "Liên hệ trung tâm",
    seatsLeft: Math.max(0, 20 - (classroom.studentsCount ?? 0)),
    subject,
    teacher: classroom.teacherName ?? "Chưa phân công",
    tuition: `${priceValue.toLocaleString("vi-VN")}đ / tháng`,
  };
}
