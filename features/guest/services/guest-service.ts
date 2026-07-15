import { api } from "@/shared/services/api";
import type { AttendanceHistoryItem, ChildSearchForm, ChildSearchResult, ClassRegistrationForm } from "../types";

export const guestService = {
  registerClass: (classId: number, form: ClassRegistrationForm) =>
    api.post<void>("/api/class-registrations", { classId, ...form }),
  searchChild: (form: ChildSearchForm) =>
    api.get<ChildSearchResult[]>(
      `/api/students/search?parentPhone=${encodeURIComponent(form.parentPhone)}&childDob=${encodeURIComponent(
        form.childDob,
      )}`,
    ),
  getAttendanceHistory: (studentId: number) =>
    api.get<AttendanceHistoryItem[]>(`/api/attendances/student/${studentId}`),
};
