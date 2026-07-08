export type Classroom = {
  id: number;
  name: string;
  tuitionFee: number;
  teacherId?: number | null;
};

export type ClassroomOverview = {
  name: string;
  teacher: string;
  students: number;
  tuition: string;
  status: "Active" | "Scheduling" | "Paused";
};
