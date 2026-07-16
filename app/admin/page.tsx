import { AdminDashboardShell } from "@/features/admin/components/AdminDashboardShell";
import { registrationRequests, scheduleEvents as demoScheduleEvents } from "@/features/admin/data/admin-data";
import { adminService } from "@/features/admin/services/admin-service";
import type { Lesson, RegistrationRequest, ScheduleEvent, Teacher } from "@/features/admin/types";
import { classroomOverviews } from "@/features/classes/data/classes-data";
import { classesService } from "@/features/classes/services/classes-service";
import type { Classroom, ClassroomOverview } from "@/features/classes/types";
import { recentStudents } from "@/features/students/data/students-data";
import { studentsService } from "@/features/students/services/students-service";
import type { RecentStudent, Student } from "@/features/students/types";
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

  const [classes, students, teachers, scheduleEvents, registrations] = await Promise.all([
    loadClasses(),
    loadStudents(),
    loadTeachers(),
    loadScheduleEvents(),
    loadRegistrations(),
  ]);

  return (
    <AdminDashboardShell
      classes={classes}
      registrations={registrations}
      scheduleEvents={scheduleEvents}
      students={students}
      teachers={teachers}
    />
  );
}

async function loadRegistrations(): Promise<RegistrationRequest[]> {
  try {
    return await adminService.getRegistrations();
  } catch {
    return registrationRequests;
  }
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
    className: student.currentClass ?? "Chưa có lớp",
  };
}

async function loadTeachers(): Promise<Teacher[]> {
  try {
    const result = await adminService.getTeachers();
    return result.items;
  } catch {
    return [
      { id: 1, fullname: "Nguyễn Thị Lan", phone: null, classesCount: 2 },
      { id: 2, fullname: "Trần Minh Khoa", phone: null, classesCount: 3 },
      { id: 3, fullname: "Phạm Gia Hân", phone: null, classesCount: 4 },
    ];
  }
}

async function loadScheduleEvents(): Promise<ScheduleEvent[]> {
  try {
    const result = await adminService.getLessons();
    return result.items.map(mapLessonToScheduleEvent);
  } catch {
    return demoScheduleEvents;
  }
}

function mapLessonToScheduleEvent(lesson: Lesson, index: number): ScheduleEvent {
  const start = new Date(lesson.startTime);
  const end = new Date(lesson.endTime);
  const day = start.getDay();
  const dayIndex = day === 0 ? 6 : day - 1;
  const durationHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3_600_000));
  const colors = ["#a36c45", "#17b8a6", "#8b5cf6", "#f97316", "#0ea5e9", "#22c55e", "#f59e0b"];

  return {
    id: lesson.id,
    classroomId: lesson.classroomId,
    className: lesson.classroomName,
    color: colors[index % colors.length],
    dayIndex,
    durationHours,
    repeatType: "fixed",
    room: "Phòng học",
    startHour: start.getHours(),
    status: "confirmed",
    teacher: lesson.teacherName ?? "Chưa phân công",
  };
}
