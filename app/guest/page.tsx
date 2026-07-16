import { GuestLandingPage } from "@/features/guest/components/GuestLandingPage";
import { demoChildResults, publicClasses } from "@/features/guest/data/guest-data";
import { classesService } from "@/features/classes/services/classes-service";
import type { Classroom } from "@/features/classes/types";
import type { PublicClass } from "@/features/guest/types";
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export const dynamic = "force-dynamic";

export default async function GuestPage() {
  const classes = await loadPublicClasses();

  const supabase = await createClient();
  const [user] = await Promise.all([getUser(supabase)]);

  let hasUser = true;
  if(!user) {
    hasUser = false;
  }

  let userRole = user?.app_metadata?.role;

  return <GuestLandingPage
      childResults={demoChildResults}
      classes={classes}
      hasUser={hasUser}
      userRole={userRole}/>;
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
  const priceValue = Number(classroom.tuitionFee);
  const capacity = classroom.capacity ?? 20;
  const studentsCount = classroom.studentsCount ?? 0;
  const seatsLeft = Math.max(0, capacity - studentsCount);
  const ageRange = classroom.ageGroup || "Liên hệ trung tâm";

  return {
    id: classroom.id,
    ageGroup: ageRange,
    ageRange,
    description:
      classroom.description ??
      "Lớp đang mở tại trung tâm, phù hợp để con rèn luyện sự tập trung và vận động nhẹ nhàng.",
    highlight: index === 0 || studentsCount >= capacity * 0.7 ? "Bán chạy" : index % 2 === 0 ? "Lớp mới" : "Còn chỗ",
    name: classroom.name,
    priceTier: priceValue < 2_000_000 ? "under2m" : priceValue <= 2_500_000 ? "2mto25m" : "over25m",
    priceValue,
    schedule: "Liên hệ trung tâm",
    seatsLeft,
    subject: classroom.name,
    teacher: classroom.teacherName ?? "Chưa phân công",
    tuition: `${priceValue.toLocaleString("vi-VN")}đ / tháng`,
  };
}
