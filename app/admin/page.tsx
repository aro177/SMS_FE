import { AdminDashboardShell } from "@/features/admin/components/AdminDashboardShell";
import { classroomOverviews } from "@/features/classes/data/classes-data";
import { classesService } from "@/features/classes/services/classes-service";
import type { Classroom, ClassroomOverview } from "@/features/classes/types";
import { summaryMetrics } from "@/features/dashboard/data/dashboard-data";
import { setupTasks } from "@/features/setup/data/setup-data";
import { recentStudents } from "@/features/students/data/students-data";
import { studentsService } from "@/features/students/services/students-service";
import type { RecentStudent, Student } from "@/features/students/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [classes, students] = await Promise.all([loadClasses(), loadStudents()]);

  return (
    <AdminDashboardShell
      classes={classes}
      metrics={summaryMetrics}
      setupTasks={setupTasks}
      students={students}
    />
  );
}

async function loadClasses(): Promise<ClassroomOverview[]> {
  try {
    const result = await classesService.getClasses();
    return result.items.map(mapClassroomToOverview);
  } catch {
    return classroomOverviews;
  }
}

async function loadStudents(): Promise<RecentStudent[]> {
  try {
    const result = await studentsService.getStudents();
    return result.items.map(mapStudentToRecentStudent);
  } catch {
    return recentStudents;
  }
}

function mapClassroomToOverview(classroom: Classroom): ClassroomOverview {
  return {
    id: classroom.id,
    name: classroom.name,
    teacher: classroom.teacherName ?? "Chưa phân công",
    students: classroom.studentsCount ?? 0,
    tuition: `${Number(classroom.tuitionFee).toLocaleString("vi-VN")}đ`,
    status: classroom.teacherId ? "Active" : "Scheduling",
  };
}

function mapStudentToRecentStudent(student: Student): RecentStudent {
  return {
    name: student.fullname,
    parent: student.parentName ?? "Chưa có phụ huynh",
    className: student.currentClass ?? "Chưa có lớp",
  };
}
