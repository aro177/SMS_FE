import { AdminDashboardShell } from "@/features/admin/components/AdminDashboardShell";
import { adminService } from "@/features/admin/services/admin-service";
import type { Lesson, RegistrationRequest, ScheduleEvent, Teacher } from "@/features/admin/types";
import { classesService } from "@/features/classes/services/classes-service";
import type { Classroom, ClassroomOverview } from "@/features/classes/types";
import { studentsService } from "@/features/students/services/students-service";
import type { RecentStudent, Student } from "@/features/students/types";
import { getSearchResultSettings } from "@/features/settings/server/search-result-settings-repository";
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const user = hasSupabaseConfig ? await getUser(await createClient()) : null;

  if (hasSupabaseConfig && !user) {
    return redirect('/signin');
  }

  const [classes, students, teachers, scheduleEvents, registrations, searchResultSettings] = await Promise.all([
    loadClasses(),
    loadStudents(),
    loadTeachers(),
    loadScheduleEvents(),
    loadRegistrations(),
    getSearchResultSettings(),
  ]);

  return (
    <AdminDashboardShell
      classes={classes}
      registrations={registrations}
      scheduleEvents={scheduleEvents}
      searchResultSettings={searchResultSettings}
      students={students}
      teachers={teachers}
    />
  );
}

async function loadRegistrations(): Promise<RegistrationRequest[]> {
  try {
    return await adminService.getRegistrations();
  } catch {
    return [];
  }
}

async function loadClasses(): Promise<ClassroomOverview[]> {
  try {
    const result = await classesService.getClasses();
    return result.items.map(mapClassroomToOverview);
  } catch {
    return [];
  }
}

async function loadStudents(): Promise<RecentStudent[]> {
  try {
    const result = await studentsService.getStudents();
    return result.items.map(mapStudentToRecentStudent);
  } catch {
    return [];
  }
}

function mapClassroomToOverview(classroom: Classroom): ClassroomOverview {
  return {
    id: classroom.id,
    name: classroom.name,
    teacher: classroom.teacherName ?? "Chưa phân công",
    teacherId: classroom.teacherId,
    students: classroom.studentsCount ?? 0,
    tuition: `${Number(classroom.tuitionFee).toLocaleString("vi-VN")}đ`,
    tuitionFee: Number(classroom.tuitionFee),
    status: classroom.teacherId ? "Active" : "Scheduling",
    ageGroup: classroom.ageGroup,
    description: classroom.description,
    capacity: classroom.capacity,
  };
}

function mapStudentToRecentStudent(student: Student): RecentStudent {
  return {
    name: student.fullname,
    parent: student.parentName ?? "Chưa có phụ huynh",
    classNames: student.currentClass,
  };
}

async function loadTeachers(): Promise<Teacher[]> {
  try {
    const result = await adminService.getTeachers();
    return result.items;
  } catch {
    return [];
  }
}

async function loadScheduleEvents(): Promise<ScheduleEvent[]> {
  try {
    const result = await adminService.getLessons();
    return result.items.map(mapLessonToScheduleEvent);
  } catch {
    return [];
  }
}

function mapLessonToScheduleEvent(lesson: Lesson, index: number): ScheduleEvent {
  const start = new Date(lesson.startTime);
  const end = new Date(lesson.endTime);
  const day = start.getDay();
  const dayIndex = day === 0 ? 6 : day - 1;
  const durationHours = Math.max(0.5, Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 2) / 2);
  const colors = ["#a36c45", "#17b8a6", "#8b5cf6", "#f97316", "#0ea5e9", "#22c55e", "#f59e0b"];

  return {
    id: lesson.id,
    classroomId: lesson.classroomId,
    className: lesson.classroomName,
    code: lesson.code,
    color: colors[index % colors.length],
    dayIndex,
    durationHours,
    occurrenceDate: formatLocalDateKey(start),
    repeatType: mapLessonRepeatStatus(lesson.repeatStatus),
    seriesId: lesson.seriesId,
    room: "Phòng học",
    startHour: start.getHours(),
    status: "confirmed",
    takeAttendanceStatus: lesson.takeAttendanceStatus,
    teacher: lesson.teacherName ?? "Chưa phân công",
  };
}

function mapLessonRepeatStatus(repeatStatus: Lesson["repeatStatus"]): ScheduleEvent["repeatType"] {
  if (typeof repeatStatus === "number") {
    return repeatStatus === 0 ? "fixed" : "temporary";
  }

  return repeatStatus?.toLowerCase() === "fixed" ? "fixed" : "temporary";
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
