import { api } from "@/shared/services/api";
import type { PagedResult } from "@/shared/services/api";
import type { Classroom } from "../types";

export const classesService = {
  getClasses: () => api.get<PagedResult<Classroom>>("/api/classrooms?page=1&pageSize=100"),
};
