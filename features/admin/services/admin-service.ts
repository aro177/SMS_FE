import { registrationRequests, scheduleEvents } from "@/features/admin/data/admin-data";
import { publicClasses } from "@/features/guest/data/guest-data";
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
    childName: item.childName,
    id: item.id,
    parentName: item.parentName,
    phone: item.parentPhone,
    requestedClass: item.requestedClass,
    status: item.status === "ACTIVE" ? "confirmed" : item.status === "DROPPED" ? "rejected" : "new",
    submittedAt: item.submittedAt,
  };
}

const mockTeachersSeed: Teacher[] = [
  { classesCount: 2, fullname: "Nguyễn Thị Lan", id: 1, phone: "0901112222" },
  { classesCount: 1, fullname: "Trần Minh Khoa", id: 2, phone: "0903334444" },
  { classesCount: 1, fullname: "Phạm Gia Hân", id: 3, phone: "0905556666" },
  { classesCount: 1, fullname: "Mai Thanh Hương", id: 4, phone: "0907778888" },
];

let mockTeachers: Teacher[] = [...mockTeachersSeed];
let mockRegistrations: RegistrationRequest[] = registrationRequests.map((item) => ({ ...item }));
let mockLessons: Lesson[] = scheduleEvents.map((event, index) => {
  const classroom = publicClasses.find((item) => item.name === event.className) ?? publicClasses[index % publicClasses.length];
  const teacher = mockTeachers.find((item) => item.fullname === event.teacher) ?? mockTeachers[index % mockTeachers.length];
  const startTime = buildMockLessonDate(event.dayIndex, event.startHour);
  const endTime = new Date(startTime.getTime() + event.durationHours * 3_600_000);

  return {
    classroomId: classroom?.id ?? event.classroomId ?? event.id,
    classroomName: event.className,
    endTime: endTime.toISOString(),
    id: event.id,
    startTime: startTime.toISOString(),
    teacherId: teacher?.id ?? null,
    teacherName: event.teacher,
    title: event.className,
  };
});

function buildMockLessonDate(dayIndex: number, startHour: number) {
  const monday = new Date("2026-07-20T00:00:00+07:00");
  monday.setDate(monday.getDate() + dayIndex);
  monday.setHours(startHour, 0, 0, 0);
  return monday;
}

function toPagedResult<T>(items: T[]): PagedResult<T> {
  return {
    items,
    page: 1,
    pageSize: items.length || 100,
    totalItems: items.length,
    totalPages: 1,
  };
}

function findClassName(classroomId: number) {
  return publicClasses.find((classroom) => classroom.id === classroomId)?.name ?? `Lớp #${classroomId}`;
}

function findTeacherByClassroom(classroomId: number) {
  const classroom = publicClasses.find((item) => item.id === classroomId);
  return mockTeachers.find((teacher) => teacher.fullname === classroom?.teacher) ?? mockTeachers[0] ?? null;
}

// MOCK DATA - ĐANG BẬT ĐỂ DEMO KHÔNG CẦN BACKEND
//
// Muốn dùng API thật:
// 1. Comment block `export const adminService` mock này.
// 2. Gỡ comment block "REAL API" ở cuối file.
export const adminService = {
  async getTeachers() {
    return toPagedResult([...mockTeachers]);
  },
  async createTeacher(payload: CreateTeacherPayload) {
    const teacher: Teacher = {
      classesCount: 0,
      fullname: payload.fullname,
      id: Date.now(),
      phone: payload.phone ?? null,
    };

    mockTeachers = [teacher, ...mockTeachers];
    return teacher;
  },
  async updateTeacher(id: number, payload: CreateTeacherPayload) {
    mockTeachers = mockTeachers.map((teacher) =>
      teacher.id === id ? { ...teacher, fullname: payload.fullname, phone: payload.phone ?? null } : teacher,
    );
  },
  async deleteTeacher(id: number) {
    mockTeachers = mockTeachers.filter((teacher) => teacher.id !== id);
  },
  async getLessons() {
    return toPagedResult([...mockLessons]);
  },
  async createLesson(payload: CreateLessonPayload) {
    const teacher = findTeacherByClassroom(payload.classroomId);
    const lesson: Lesson = {
      classroomId: payload.classroomId,
      classroomName: findClassName(payload.classroomId),
      endTime: payload.endTime,
      id: Date.now(),
      startTime: payload.startTime,
      teacherId: teacher?.id ?? null,
      teacherName: teacher?.fullname ?? "Chưa phân công",
      title: payload.title ?? findClassName(payload.classroomId),
    };

    mockLessons = [...mockLessons, lesson];
    return lesson;
  },
  async updateLesson(id: number, payload: UpdateLessonPayload) {
    const teacher = findTeacherByClassroom(payload.classroomId);
    mockLessons = mockLessons.map((lesson) =>
      lesson.id === id
        ? {
            ...lesson,
            classroomId: payload.classroomId,
            classroomName: findClassName(payload.classroomId),
            endTime: payload.endTime,
            startTime: payload.startTime,
            teacherId: teacher?.id ?? null,
            teacherName: teacher?.fullname ?? lesson.teacherName,
            title: payload.title,
          }
        : lesson,
    );
  },
  async getRegistrations() {
    return [...mockRegistrations];
  },
  async approveRegistration(id: number) {
    mockRegistrations = mockRegistrations.map((registration) =>
      registration.id === id ? { ...registration, status: "confirmed" } : registration,
    );
  },
  async rejectRegistration(id: number) {
    mockRegistrations = mockRegistrations.map((registration) =>
      registration.id === id ? { ...registration, status: "rejected" } : registration,
    );
  },
};

// REAL API - ĐANG TẠM COMMENT ĐỂ TEST MOCK
//
// import { api } from "@/shared/services/api";
//
// export const adminService = {
//   getTeachers: () => api.get<PagedResult<Teacher>>("/api/teachers?page=1&pageSize=100"),
//   createTeacher: (payload: CreateTeacherPayload) => api.post<Teacher>("/api/teachers", payload),
//   updateTeacher: (id: number, payload: CreateTeacherPayload) => api.put<void>(`/api/teachers/${id}`, payload),
//   deleteTeacher: (id: number) => api.delete<void>(`/api/teachers/${id}`),
//   getLessons: () => api.get<PagedResult<Lesson>>("/api/lessons?page=1&pageSize=100"),
//   createLesson: (payload: CreateLessonPayload) => api.post<Lesson>("/api/lessons", payload),
//   updateLesson: (id: number, payload: UpdateLessonPayload) => api.put<void>(`/api/lessons/${id}`, payload),
//   getRegistrations: async () => {
//     const result = await api.get<PagedResult<RegistrationApiItem>>("/api/class-registrations?page=1&pageSize=100");
//     return result.items.map(mapRegistration);
//   },
//   approveRegistration: (id: number) => api.put<void>(`/api/class-registrations/${id}/approve`, {}),
//   rejectRegistration: (id: number) => api.put<void>(`/api/class-registrations/${id}/reject`, {}),
// };
