export type TeacherOption = {
  id: number;
  fullname: string;
  phone?: string | null;
  classesCount: number;
  authUserId?: string | null;
};

export type TeacherLesson = {
  id: number;
  classroomId: number;
  classroomName: string;
  teacherId?: number | null;
  teacherName?: string | null;
  title: string;
  startTime: string;
  endTime: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AttendanceStudent = {
  studentId: number;
  studentName: string;
  attendanceId?: number | null;
  status?: AttendanceStatus | null;
  note?: string | null;
};
