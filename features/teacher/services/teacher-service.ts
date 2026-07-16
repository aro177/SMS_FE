import { api } from "@/shared/services/api";
import type { AttendanceStudent, AttendanceStatus, TeacherLesson, TeacherOption } from "../types";

export const teacherService = {
  getMe: () => api.get<TeacherOption>("/api/teachers/me"),
  getTodayLessons: () => api.get<TeacherLesson[]>("/api/lessons/my/today"),
  getLessonRoster: (lessonId: number) =>
    api.get<AttendanceStudent[]>(`/api/attendances/lesson/${lessonId}`),
  markLesson: (lessonId: number, items: { studentId: number; status: AttendanceStatus; note?: string | null }[]) =>
    api.put<void>(`/api/attendances/lesson/${lessonId}`, { items }),
};
