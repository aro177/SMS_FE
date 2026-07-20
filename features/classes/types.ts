export type Classroom = {
  id: number;
  name: string;
  tuitionFee: number;
  teacherId?: number | null;
  teacherName?: string | null;
  studentsCount?: number;
  ageGroup?: string | null;
  description?: string | null;
  capacity?: number;
};

export type ClassroomOverview = {
  id?: number;
  name: string;
  teacher: string;
  teacherId?: number | null;
  students: number;
  tuition: string;
  tuitionFee?: number;
  status: "Active" | "Scheduling" | "Paused";
  ageGroup?: string | null;
  description?: string | null;
  capacity?: number;
};
