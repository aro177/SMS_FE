import { api } from "@/shared/services/api";
import type { Classroom } from "../types";

export const classesService = {
  getClasses: () => api.get<Classroom[]>("/api/classrooms"),
};
