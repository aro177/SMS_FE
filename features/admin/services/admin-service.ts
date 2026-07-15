import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Lesson, RegistrationRequest, Teacher } from "../types";

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

type RegistrationApiItem = {
  id: number;
  childName: string;
  parentName: string;
  parentPhone: string;
  requestedClass: string;
  submittedAt: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "DROPPED";
};

function mapRegistration(item: RegistrationApiItem): RegistrationRequest {
  return {
    id: item.id,
    childName: item.childName,
    parentName: item.parentName,
    phone: item.parentPhone,
    requestedClass: item.requestedClass,
    submittedAt: item.submittedAt,
    status: item.status === "ACTIVE" ? "confirmed" : item.status === "DROPPED" ? "rejected" : "new",
  };
}

export const adminService = {
  getTeachers: () => api.get<PagedResult<Teacher>>("/api/teachers?page=1&pageSize=100"),
  createTeacher: (payload: CreateTeacherPayload) => api.post<Teacher>("/api/teachers", payload),
  updateTeacher: (id: number, payload: CreateTeacherPayload) => api.put<void>(`/api/teachers/${id}`, payload),
  deleteTeacher: (id: number) => api.delete<void>(`/api/teachers/${id}`),
  getLessons: () => api.get<PagedResult<Lesson>>("/api/lessons?page=1&pageSize=100"),
  createLesson: (payload: CreateLessonPayload) => api.post<Lesson>("/api/lessons", payload),
  updateLesson: (id: number, payload: UpdateLessonPayload) => api.put<void>(`/api/lessons/${id}`, payload),
  getRegistrations: async () => {
    const result = await api.get<PagedResult<RegistrationApiItem>>("/api/class-registrations?page=1&pageSize=100");
    return result.items.map(mapRegistration);
  },
  approveRegistration: (id: number) => api.put<void>(`/api/class-registrations/${id}/approve`, {}),
  rejectRegistration: (id: number) => api.put<void>(`/api/class-registrations/${id}/reject`, {}),
};
