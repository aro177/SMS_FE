export type Classroom = {
  id: number;
  name: string;
  tuitionFee: number;
  teacherId?: number | null;
  teacherName?: string | null;
  studentsCount?: number;
};

export type ClassroomOverview = {
  id?: number;
  name: string;
  teacher: string;
  students: number;
  tuition: string;
  status: "Active" | "Scheduling" | "Paused";
};
