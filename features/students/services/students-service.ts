import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Student } from "../types";

export type CreateStudentPayload = {
  fullname: string;
  dob?: string | null;
  height?: number | null;
  weight?: number | null;
  parentName: string;
  parentPhone: string;
};

export const studentsService = {
  getStudents: () => api.get<PagedResult<Student>>("/api/students?page=1&pageSize=100"),
  createStudent: (payload: CreateStudentPayload) => api.post<Student>("/api/students", payload),
};
