import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Lesson, Teacher } from "../types";

export type CreateTeacherPayload = {
  fullname: string;
  phone?: string | null;
};

export type CreateLessonPayload = {
  classroomId: number;
  title?: string | null;
  startTime: string;
  endTime: string;
};

export type UpdateLessonPayload = {
  classroomId: number;
  title: string;
  startTime: string;
  endTime: string;
};

export const adminService = {
  getTeachers: () => api.get<PagedResult<Teacher>>("/api/teachers?page=1&pageSize=100"),
  createTeacher: (payload: CreateTeacherPayload) => api.post<Teacher>("/api/teachers", payload),
  getLessons: () => api.get<PagedResult<Lesson>>("/api/lessons?page=1&pageSize=100"),
  createLesson: (payload: CreateLessonPayload) => api.post<Lesson>("/api/lessons", payload),
  updateLesson: (id: number, payload: UpdateLessonPayload) => api.put<void>(`/api/lessons/${id}`, payload),
};
