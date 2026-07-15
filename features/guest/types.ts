export type PublicClass = {
  id: number;
  name: string;
  subject: string;
  ageGroup: string;
  ageRange: string;
  schedule: string;
  teacher: string;
  tuition: string;
  priceValue: number;
  priceTier: "under2m" | "2mto25m" | "over25m";
  description: string;
  seatsLeft: number;
  highlight: "Bán chạy" | "Còn chỗ" | "Lớp mới";
};

export type ClassRegistrationForm = {
  childName: string;
  childDob: string;
  parentName: string;
  parentPhone: string;
  note: string;
};

export type ChildSearchForm = {
  parentPhone: string;
  childDob: string;
};

export type ChildSearchResult = {
  studentId: number;
  childName: string;
  dateOfBirth: string;
  parentPhone: string;
  currentClass: string;
  attendanceRate: string;
  latestNote: string;
};

export type AttendanceHistoryItem = {
  id: number;
  lessonId: number;
  lessonTitle: string;
  classroomName: string;
  startTime: string;
  endTime: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string | null;
};
