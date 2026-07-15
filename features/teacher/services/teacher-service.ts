import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { AttendanceStudent, AttendanceStatus, TeacherLesson, TeacherOption } from "../types";

export const teacherService = {
  getTeachers: async () => {
    const result = await api.get<PagedResult<TeacherOption>>("/api/teachers?page=1&pageSize=100");
    return result.items;
  },
  getLessons: async (teacherId: number) => {
    const result = await api.get<PagedResult<TeacherLesson>>(
      `/api/lessons?page=1&pageSize=200&teacherId=${teacherId}`,
    );
    return result.items;
  },
  getLessonRoster: (lessonId: number) =>
    api.get<AttendanceStudent[]>(`/api/attendances/lesson/${lessonId}`),
  markLesson: (lessonId: number, items: { studentId: number; status: AttendanceStatus; note?: string | null }[]) =>
    api.put<void>(`/api/attendances/lesson/${lessonId}`, { items }),
};
