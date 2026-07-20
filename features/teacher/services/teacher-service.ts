import type { AttendanceStatus, AttendanceStudent, TeacherLesson, TeacherOption } from "../types";

// =========================
// MOCK DATA - DANG BAT DE TEST DIEM DANH
// Khi muon dung API that:
// 1. Comment block mock nay lai.
// 2. Mo block "REAL API" o cuoi file.
// =========================

const mockTeacher: TeacherOption = {
  authUserId: "mock-auth-user-id",
  classesCount: 3,
  fullname: "Nguyen Thi Lan",
  id: 1,
  phone: "0901234567",
};

const todayAt = (hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockLessons: TeacherLesson[] = [
  {
    classroomId: 1,
    classroomName: "Yoga nen tang buoi sang",
    endTime: todayAt(9),
    id: 101,
    startTime: todayAt(7),
    teacherId: 1,
    teacherName: mockTeacher.fullname,
    title: "Tiet 1 - Khoi dong va hoi tho",
  },
  {
    classroomId: 2,
    classroomName: "Thien tho sau gio hoc",
    endTime: todayAt(15, 30),
    id: 102,
    startTime: todayAt(14),
    teacherId: 1,
    teacherName: mockTeacher.fullname,
    title: "Tiet 2 - Tap trung va thu gian",
  },
  {
    classroomId: 3,
    classroomName: "Van dong nhip dieu",
    endTime: todayAt(18),
    id: 103,
    startTime: todayAt(16, 30),
    teacherId: 1,
    teacherName: mockTeacher.fullname,
    title: "Tiet 3 - Van dong nhe",
  },
];

const mockRosterByLesson = new Map<number, AttendanceStudent[]>([
  [
    101,
    [
      { studentId: 1, studentName: "Le Bao Anh", status: "PRESENT" },
      { studentId: 2, studentName: "Do Minh Chau", status: "PRESENT" },
      { studentId: 3, studentName: "Hoang Nam Phong", status: "ABSENT" },
      { studentId: 4, studentName: "Nguyen Minh Khue", status: "PRESENT" },
      { studentId: 5, studentName: "Tran Gia Bao", status: "PRESENT" },
    ],
  ],
  [
    102,
    [
      { studentId: 6, studentName: "Pham Khanh Linh", status: "PRESENT" },
      { studentId: 7, studentName: "Dang Tue Minh", status: "PRESENT" },
      { studentId: 8, studentName: "Vu Nhat An", status: "PRESENT" },
      { studentId: 9, studentName: "Bui Ha My", status: "ABSENT" },
    ],
  ],
  [
    103,
    [
      { studentId: 10, studentName: "Mai Bao Ngoc", status: "PRESENT" },
      { studentId: 11, studentName: "Nguyen Duc Anh", status: "PRESENT" },
      { studentId: 12, studentName: "Tran Minh Quan", status: "PRESENT" },
      { studentId: 13, studentName: "Le Gia Han", status: "PRESENT" },
      { studentId: 14, studentName: "Pham Thanh Truc", status: "PRESENT" },
      { studentId: 15, studentName: "Do Hoai Nam", status: "ABSENT" },
    ],
  ],
]);

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const teacherService = {
  async getMe() {
    await delay();
    return mockTeacher;
  },
  async getTodayLessons() {
    await delay();
    return mockLessons;
  },
  async getLessonRoster(lessonId: number) {
    await delay();
    return [...(mockRosterByLesson.get(lessonId) ?? [])];
  },
  async markLesson(
    lessonId: number,
    items: { studentId: number; status: AttendanceStatus; note?: string | null }[],
  ) {
    await delay();
    const currentRoster = mockRosterByLesson.get(lessonId) ?? [];
    const updatedRoster = currentRoster.map((student) => {
      const next = items.find((item) => item.studentId === student.studentId);
      return next ? { ...student, note: next.note, status: next.status } : student;
    });
    mockRosterByLesson.set(lessonId, updatedRoster);
  },
};

/*
// =========================
// REAL API - DANG TAM COMMENT DE TEST MOCK
// Khi muon dung API that:
// 1. Comment block mock phia tren.
// 2. Mo block nay ra.
// =========================

import { api } from "@/shared/services/api";

export const teacherService = {
  getMe: () => api.get<TeacherOption>("/api/teachers/me"),
  getTodayLessons: () => api.get<TeacherLesson[]>("/api/lessons/my/today"),
  getLessonRoster: (lessonId: number) =>
    api.get<AttendanceStudent[]>(`/api/attendances/lesson/${lessonId}`),
  markLesson: (lessonId: number, items: { studentId: number; status: AttendanceStatus; note?: string | null }[]) =>
    api.put<void>(`/api/attendances/lesson/${lessonId}`, { items }),
};
*/
