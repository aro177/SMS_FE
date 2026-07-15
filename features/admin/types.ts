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
  className: string;
  teacher: string;
  room: string;
  dayIndex: number;
  startHour: number;
  durationHours: number;
  status: "confirmed" | "draft" | "conflict";
  repeatType: "fixed" | "temporary";
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
};
