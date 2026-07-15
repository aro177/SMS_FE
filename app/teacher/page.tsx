import { TeacherDashboard } from "@/features/teacher/components/TeacherDashboard";
import { teacherService } from "@/features/teacher/services/teacher-service";
import type { TeacherOption } from "@/features/teacher/types";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const teachers = await loadTeachers();

  return <TeacherDashboard teachers={teachers} />;
}

async function loadTeachers(): Promise<TeacherOption[]> {
  try {
    return await teacherService.getTeachers();
  } catch {
    return [
      { id: 1, fullname: "Nguyễn Thị Lan", phone: null, classesCount: 2 },
      { id: 2, fullname: "Trần Minh Khoa", phone: null, classesCount: 3 },
      { id: 3, fullname: "Phạm Gia Hân", phone: null, classesCount: 1 },
    ];
  }
}
