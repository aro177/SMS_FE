export type RegistrationRequest = {
  id: number;
  childName: string;
  parentName: string;
  phone: string;
  requestedClass: string;
  submittedAt: string;
  status: "new" | "called" | "confirmed" | "rejected";
};

export type ScheduleEvent = {
  id: number;
  classroomId?: number;
  code: string;
  className: string;
  teacher: string;
  room: string;
  dayIndex: number;
  occurrenceDate: string;
  startHour: number;
  durationHours: number;
  status: "confirmed" | "draft" | "conflict";
  takeAttendanceStatus: boolean;
  repeatType: "fixed" | "temporary";
  seriesId?: string | null;
  color: string;
};

export type Teacher = {
  id: number;
  fullname: string;
  phone?: string | null;
  classesCount: number;
};

export type Lesson = {
  id: number;
  classroomId: number;
  classroomName: string;
  teacherId?: number | null;
  teacherName?: string | null;
  title: string;
  startTime: string;
  endTime: string;
  code: string;
  takeAttendanceStatus: boolean;
  repeatStatus?: number | string | null;
  seriesId?: string | null;
};

export type LessonAttendanceDetail = {
  id: number;
  lessonId: number;
  studentId: number;
  studentName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TakeAttendanceStatusResponse = {
  lessonId: number;
  takeAttendanceStatus: boolean;
};

export type BulkTakeAttendanceStatusResponse = {
  date: string;
  takeAttendanceStatus: boolean;
  updatedLessons: number;
};
