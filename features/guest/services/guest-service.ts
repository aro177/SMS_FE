import { demoChildResults, publicClasses } from "../data/guest-data";
import type { AttendanceHistoryItem, ChildSearchForm, ChildSearchResult, ClassRegistrationForm } from "../types";

const mockAttendanceHistoryByStudentId = new Map<number, AttendanceHistoryItem[]>([
  [
    1,
    [
      {
        classroomName: publicClasses[0]?.name ?? "Yoga nền tảng buổi sáng",
        endTime: "2026-07-20T02:00:00.000Z",
        id: 1,
        lessonId: 1,
        lessonTitle: "Yoga nền tảng",
        note: "Con tập trung tốt.",
        startTime: "2026-07-20T00:00:00.000Z",
        status: "PRESENT",
      },
      {
        classroomName: publicClasses[0]?.name ?? "Yoga nền tảng buổi sáng",
        endTime: "2026-07-17T02:00:00.000Z",
        id: 2,
        lessonId: 2,
        lessonTitle: "Thở chậm và giữ thăng bằng",
        note: null,
        startTime: "2026-07-17T00:00:00.000Z",
        status: "PRESENT",
      },
      {
        classroomName: publicClasses[0]?.name ?? "Yoga nền tảng buổi sáng",
        endTime: "2026-07-15T02:00:00.000Z",
        id: 3,
        lessonId: 3,
        lessonTitle: "Chuyển động nhẹ",
        note: "Phụ huynh xin nghỉ.",
        startTime: "2026-07-15T00:00:00.000Z",
        status: "EXCUSED",
      },
    ],
  ],
  [
    2,
    [
      {
        classroomName: publicClasses[2]?.name ?? "Vận động buổi tối",
        endTime: "2026-07-19T13:30:00.000Z",
        id: 4,
        lessonId: 4,
        lessonTitle: "Vận động sức bền",
        note: "Con đến muộn 5 phút.",
        startTime: "2026-07-19T11:30:00.000Z",
        status: "LATE",
      },
    ],
  ],
]);

const mockRegistrations: Array<ClassRegistrationForm & { classId: number; id: number }> = [];

// MOCK DATA - ĐANG BẬT ĐỂ DEMO KHÔNG CẦN BACKEND
//
// Muốn dùng API thật:
// 1. Comment block `export const guestService` mock này.
// 2. Gỡ comment block "REAL API" ở cuối file.
export const guestService = {
  async registerClass(classId: number, form: ClassRegistrationForm) {
    mockRegistrations.push({ ...form, classId, id: Date.now() });
  },
  async searchChild(form: ChildSearchForm): Promise<ChildSearchResult[]> {
    const parentPhone = form.parentPhone.trim();
    const childDob = form.childDob;
    const matches = demoChildResults.filter(
      (student) => student.parentPhone === parentPhone && student.dateOfBirth === childDob,
    );

    return matches.length > 0 ? matches : demoChildResults;
  },
  async getAttendanceHistory(studentId: number) {
    return [...(mockAttendanceHistoryByStudentId.get(studentId) ?? [])];
  },
};

// REAL API - ĐANG TẠM COMMENT ĐỂ TEST MOCK
//
// import { api } from "@/shared/services/api";
//
// export const guestService = {
//   registerClass: (classId: number, form: ClassRegistrationForm) =>
//     api.post<void>("/api/class-registrations", { classId, ...form }),
//   searchChild: (form: ChildSearchForm) =>
//     api.get<ChildSearchResult[]>(
//       `/api/students/search?parentPhone=${encodeURIComponent(form.parentPhone)}&childDob=${encodeURIComponent(
//         form.childDob,
//       )}`,
//     ),
//   getAttendanceHistory: (studentId: number) =>
//     api.get<AttendanceHistoryItem[]>(`/api/attendances/student/${studentId}`),
// };
