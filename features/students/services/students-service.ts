import { api } from "@/shared/services/api";
import type { Student } from "../types";

export const studentsService = {
  getStudents: () => api.get<Student[]>("/api/students"),
};
