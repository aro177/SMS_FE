import { publicClasses } from "@/features/guest/data/guest-data";
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

let mockStudents: Student[] = [
  {
    currentClass: publicClasses[0]?.name ?? "Yoga nền tảng buổi sáng",
    dob: "2016-08-12",
    fullname: "Lê Bảo Anh",
    height: 126,
    id: 1,
    parentId: 1,
    parentName: "Lê Thanh Tùng",
    parentPhone: "0901234567",
    weight: 24,
  },
  {
    currentClass: publicClasses[2]?.name ?? "Vận động buổi tối",
    dob: "2014-04-22",
    fullname: "Đỗ Minh Châu",
    height: 138,
    id: 2,
    parentId: 2,
    parentName: "Đỗ Quỳnh Mai",
    parentPhone: "0912345678",
    weight: 32,
  },
  {
    currentClass: publicClasses[1]?.name ?? "Thiền thở sau giờ học",
    dob: "2015-11-03",
    fullname: "Hoàng Nam Phong",
    height: 132,
    id: 3,
    parentId: 3,
    parentName: "Hoàng Việt Đức",
    parentPhone: "0987654321",
    weight: 29,
  },
];

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
// 1. Comment block `export const studentsService` mock này.
// 2. Gỡ comment block "REAL API" ở cuối file.
export const studentsService = {
  async getStudents() {
    return toPagedResult([...mockStudents]);
  },
  async createStudent(payload: CreateStudentPayload) {
    const student: Student = {
      currentClass: publicClasses[0]?.name ?? "Chưa có lớp",
      dob: payload.dob,
      fullname: payload.fullname,
      height: payload.height,
      id: Date.now(),
      parentId: Date.now() + 1,
      parentName: payload.parentName,
      parentPhone: payload.parentPhone,
      weight: payload.weight,
    };

    mockStudents = [student, ...mockStudents];
    return student;
  },
};

// REAL API - ĐANG TẠM COMMENT ĐỂ TEST MOCK
//
// import { api } from "@/shared/services/api";
//
// export const studentsService = {
//   getStudents: () => api.get<PagedResult<Student>>("/api/students?page=1&pageSize=100"),
//   createStudent: (payload: CreateStudentPayload) => api.post<Student>("/api/students", payload),
// };
