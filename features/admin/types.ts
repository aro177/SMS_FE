export type RegistrationRequest = {
  id: number;
  childName: string;
  parentName: string;
  phone: string;
  requestedClass: string;
  submittedAt: string;
  status: "new" | "called" | "confirmed";
};

export type ScheduleEvent = {
  id: number;
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
