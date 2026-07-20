import { publicClasses } from "@/features/guest/data/guest-data";
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

const mockTeacherNames = ["Nguyễn Thị Lan", "Trần Minh Khoa", "Phạm Gia Hân", "Mai Thanh Hương"];

let mockClassrooms: Classroom[] = publicClasses.map((classroom, index) => ({
  ageGroup: classroom.ageRange,
  capacity: classroom.seatsLeft + 12 + index * 2,
  description: classroom.description,
  id: classroom.id,
  name: classroom.name,
  studentsCount: 12 + index * 2,
  teacherId: index + 1,
  teacherName: classroom.teacher || mockTeacherNames[index % mockTeacherNames.length],
  tuitionFee: classroom.priceValue,
}));

function toPagedResult<T>(items: T[]): PagedResult<T> {
  return {
    items,
    page: 1,
    pageSize: items.length || 100,
    totalItems: items.length,
    totalPages: 1,
  };
}

// MOCK DATA - ĐANG BẬT ĐỂ DEMO KHÔNG CẦN BACKEND
//
// Muốn dùng API thật:
// 1. Comment block `export const classesService` mock này.
// 2. Gỡ comment block "REAL API" ở cuối file.
export const classesService = {
  async getClasses() {
    return toPagedResult([...mockClassrooms]);
  },
  async createClass(payload: CreateClassroomPayload) {
    const classroom: Classroom = {
      ageGroup: payload.ageGroup,
      capacity: payload.capacity ?? 20,
      description: payload.description,
      id: Date.now(),
      name: payload.name,
      studentsCount: 0,
      teacherId: payload.teacherId,
      teacherName: payload.teacherId ? mockTeacherNames[(payload.teacherId - 1) % mockTeacherNames.length] : null,
      tuitionFee: payload.tuitionFee,
    };

    mockClassrooms = [classroom, ...mockClassrooms];
    return classroom;
  },
  async updateClass(id: number, payload: CreateClassroomPayload) {
    mockClassrooms = mockClassrooms.map((classroom) =>
      classroom.id === id
        ? {
            ...classroom,
            ageGroup: payload.ageGroup,
            capacity: payload.capacity ?? classroom.capacity,
            description: payload.description,
            name: payload.name,
            teacherId: payload.teacherId,
            teacherName: payload.teacherId
              ? mockTeacherNames[(payload.teacherId - 1) % mockTeacherNames.length]
              : null,
            tuitionFee: payload.tuitionFee,
          }
        : classroom,
    );
  },
  async deleteClass(id: number) {
    mockClassrooms = mockClassrooms.filter((classroom) => classroom.id !== id);
  },
};

// REAL API - ĐANG TẠM COMMENT ĐỂ TEST MOCK
//
// import { api } from "@/shared/services/api";
//
// export const classesService = {
//   getClasses: () => api.get<PagedResult<Classroom>>("/api/classrooms?page=1&pageSize=100"),
//   createClass: (payload: CreateClassroomPayload) => api.post<Classroom>("/api/classrooms", payload),
//   updateClass: (id: number, payload: CreateClassroomPayload) => api.put<void>(`/api/classrooms/${id}`, payload),
//   deleteClass: (id: number) => api.delete<void>(`/api/classrooms/${id}`),
// };
