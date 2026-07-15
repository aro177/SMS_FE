import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Classroom } from "../types";

export type CreateClassroomPayload = {
  name: string;
  tuitionFee: number;
  teacherId?: number | null;
  ageGroup?: string | null;
  description?: string | null;
  capacity?: number;
};

export const classesService = {
  getClasses: () => api.get<PagedResult<Classroom>>("/api/classrooms?page=1&pageSize=100"),
  createClass: (payload: CreateClassroomPayload) => api.post<Classroom>("/api/classrooms", payload),
  updateClass: (id: number, payload: CreateClassroomPayload) => api.put<void>(`/api/classrooms/${id}`, payload),
  deleteClass: (id: number) => api.delete<void>(`/api/classrooms/${id}`),
};
