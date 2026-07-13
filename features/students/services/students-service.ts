import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Student } from "../types";

export const studentsService = {
  getStudents: () => api.get<PagedResult<Student>>("/api/students?page=1&pageSize=100"),
};
