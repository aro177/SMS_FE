"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { registrationRequests } from "@/features/admin/data/admin-data";
import { adminService } from "@/features/admin/services/admin-service";
import type { RegistrationRequest, ScheduleEvent, Teacher } from "@/features/admin/types";
import { ClassesTable } from "@/features/classes/components/ClassesTable";
import { classesService } from "@/features/classes/services/classes-service";
import type { ClassroomOverview } from "@/features/classes/types";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import type { SummaryMetric } from "@/features/dashboard/types";
import { guestService } from "@/features/guest/services/guest-service";
import type { SetupTask } from "@/features/setup/types";
import { RecentStudents } from "@/features/students/components/RecentStudents";
import type { RecentStudent } from "@/features/students/types";

type AdminTab = "overview" | "schedule" | "classes" | "students" | "registrations" | "teachers" | "setup";
type FilterValue = "all" | string;
type ScheduleView = "day" | "week" | "month";

type AdminDashboardShellProps = {
  classes: ClassroomOverview[];
  metrics: SummaryMetric[];
  scheduleEvents: ScheduleEvent[];
  setupTasks: SetupTask[];
  students: RecentStudent[];
  teachers: Teacher[];
};

type ScheduleFormState = {
  className: string;
  dayIndex: number;
  startHour: number;
  durationHours: number;
  repeatType: ScheduleEvent["repeatType"];
  room: string;
  status: ScheduleEvent["status"];
};

type ClassFormState = {
  name: string;
  teacher: string;
  students: number;
  tuition: string;
  status: ClassroomOverview["status"];
};

type StudentFormState = {
  dob: string;
  name: string;
  parent: string;
  parentPhone: string;
  className: string;
};

type RegistrationFormState = {
  childDob: string;
  childName: string;
  parentName: string;
  phone: string;
  requestedClass: string;
};

const adminTabs: { id: AdminTab; label: string; helper: string; icon: "grid" | "calendar" | "book" | "users" | "clipboard" | "teacher" | "settings" }[] = [
  { id: "overview", label: "Tổng quan", helper: "Theo dõi nhanh tình hình trung tâm", icon: "grid" },
  { id: "schedule", label: "Sắp xếp lịch học", helper: "Xếp giờ học theo tuần", icon: "calendar" },
  { id: "classes", label: "Quản lý lớp học", helper: "Lịch, học phí và sĩ số", icon: "book" },
  { id: "students", label: "Quản lý học viên", helper: "Thông tin con và phụ huynh", icon: "users" },
  { id: "registrations", label: "Đăng ký học", helper: "Yêu cầu mới từ cổng phụ huynh", icon: "clipboard" },
  { id: "teachers", label: "Quản lý giáo viên", helper: "Phân công lớp và lịch dạy", icon: "teacher" },
  { id: "setup", label: "Thiết lập hệ thống", helper: "Checklist bàn giao", icon: "settings" },
];

const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const timeSlots = Array.from({ length: 15 }, (_, index) => index + 7);
const eventColors = ["#a36c45", "#17b8a6", "#8b5cf6", "#f97316", "#0ea5e9", "#22c55e", "#f59e0b"];
const defaultRoom = "Phòng Sen";

const registrationStatusLabels: Record<RegistrationRequest["status"], string> = {
  new: "Mới",
  called: "Đã gọi",
  confirmed: "Đã xác nhận",
};

const repeatTypeLabels: Record<ScheduleEvent["repeatType"], string> = {
  fixed: "Cố định",
  temporary: "Tạm thời",
};

export function AdminDashboardShell({ classes, metrics, scheduleEvents, setupTasks, students, teachers }: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [classItems, setClassItems] = useState<ClassroomOverview[]>(classes);
  const [studentItems, setStudentItems] = useState<RecentStudent[]>(students);
  const [registrationItems, setRegistrationItems] = useState<RegistrationRequest[]>(registrationRequests);
  const [teacherItems, setTeacherItems] = useState<Teacher[]>(teachers);
  const [setupItems, setSetupItems] = useState<SetupTask[]>(setupTasks);
  const [notice, setNotice] = useState("Sẵn sàng quản lý trung tâm.");
  const [classKeyword, setClassKeyword] = useState("");
  const [classStatus, setClassStatus] = useState<FilterValue>("all");
  const [studentKeyword, setStudentKeyword] = useState("");
  const [studentClass, setStudentClass] = useState<FilterValue>("all");
  const [registrationKeyword, setRegistrationKeyword] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<FilterValue>("all");
  const [scheduleTeacher, setScheduleTeacher] = useState<FilterValue>("all");
  const [scheduleRoom, setScheduleRoom] = useState<FilterValue>("all");
  const [scheduleStatus, setScheduleStatus] = useState<FilterValue>("all");
  const [scheduleView, setScheduleView] = useState<ScheduleView>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<ScheduleEvent[]>(scheduleEvents);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(() =>
    createScheduleFormState(classes[0]?.name ?? ""),
  );
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [classForm, setClassForm] = useState<ClassFormState>(() => createClassFormState());
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<StudentFormState>(() => createStudentFormState(classes[0]?.name ?? ""));
  const [registrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormState>(() =>
    createRegistrationFormState(classes[0]?.name ?? ""),
  );
  const [teacherFormOpen, setTeacherFormOpen] = useState(false);
  const [teacherName, setTeacherName] = useState("");

  const filteredClasses = useMemo(
    () =>
      classItems.filter((classroom) => {
        const keyword = classKeyword.trim().toLowerCase();
        const matchesKeyword =
          keyword.length === 0 ||
          classroom.name.toLowerCase().includes(keyword) ||
          classroom.teacher.toLowerCase().includes(keyword);
        const matchesStatus = classStatus === "all" || classroom.status === classStatus;

        return matchesKeyword && matchesStatus;
      }),
    [classItems, classKeyword, classStatus],
  );

  const classNames = useMemo(() => Array.from(new Set(studentItems.map((student) => student.className))), [studentItems]);

  const filteredStudents = useMemo(
    () =>
      studentItems.filter((student) => {
        const keyword = studentKeyword.trim().toLowerCase();
        const matchesKeyword =
          keyword.length === 0 ||
          student.name.toLowerCase().includes(keyword) ||
          student.parent.toLowerCase().includes(keyword) ||
          student.className.toLowerCase().includes(keyword);
        const matchesClass = studentClass === "all" || student.className === studentClass;

        return matchesKeyword && matchesClass;
      }),
    [studentClass, studentItems, studentKeyword],
  );

  const filteredRegistrations = useMemo(
    () =>
      registrationItems.filter((request) => {
        const keyword = registrationKeyword.trim().toLowerCase();
        const matchesKeyword =
          keyword.length === 0 ||
          request.childName.toLowerCase().includes(keyword) ||
          request.parentName.toLowerCase().includes(keyword) ||
          request.phone.includes(keyword) ||
          request.requestedClass.toLowerCase().includes(keyword);
        const matchesStatus = registrationStatus === "all" || request.status === registrationStatus;

        return matchesKeyword && matchesStatus;
      }),
    [registrationItems, registrationKeyword, registrationStatus],
  );

  const scheduleTeachers = useMemo(() => Array.from(new Set(scheduleItems.map((event) => event.teacher))), [scheduleItems]);
  const scheduleRooms = useMemo(() => Array.from(new Set(scheduleItems.map((event) => event.room))), [scheduleItems]);

  const filteredScheduleItems = useMemo(
    () =>
      scheduleItems.filter((event) => {
        const matchesTeacher = scheduleTeacher === "all" || event.teacher === scheduleTeacher;
        const matchesRoom = scheduleRoom === "all" || event.room === scheduleRoom;
        const matchesStatus = scheduleStatus === "all" || event.status === scheduleStatus;

        return matchesTeacher && matchesRoom && matchesStatus;
      }),
    [scheduleItems, scheduleRoom, scheduleStatus, scheduleTeacher],
  );

  function openCreateScheduleForm() {
    const firstClass = classItems[0];
    setEditingScheduleId(null);
    setScheduleForm(createScheduleFormState(firstClass?.name ?? ""));
    setScheduleFormOpen(true);
  }

  function openEditScheduleForm(event: ScheduleEvent) {
    setEditingScheduleId(event.id);
    setScheduleForm({
      className: event.className,
      dayIndex: event.dayIndex,
      durationHours: event.durationHours,
      repeatType: event.repeatType,
      room: event.room,
      startHour: event.startHour,
      status: event.status,
    });
    setScheduleFormOpen(true);
  }

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedClass = classItems.find((classroom) => classroom.name === scheduleForm.className);
    if (!selectedClass?.id) {
      setNotice("Lớp này chưa có ID backend, chưa thể lưu lịch thật.");
      return;
    }

    const startTime = buildLessonDate(scheduleForm.dayIndex, scheduleForm.startHour);
    const endTime = new Date(startTime.getTime() + scheduleForm.durationHours * 3_600_000);
    const nextEvent: ScheduleEvent = {
      id: editingScheduleId ?? Date.now(),
      classroomId: selectedClass.id,
      className: scheduleForm.className,
      teacher: selectedClass?.teacher ?? "Chưa chọn",
      room: scheduleForm.room,
      dayIndex: Number(scheduleForm.dayIndex),
      durationHours: Number(scheduleForm.durationHours),
      startHour: Number(scheduleForm.startHour),
      repeatType: scheduleForm.repeatType,
      status: scheduleForm.status,
      color:
        scheduleItems.find((item) => item.id === editingScheduleId)?.color ??
        eventColors[scheduleItems.length % eventColors.length],
    };

    try {
      if (editingScheduleId === null) {
        const saved = await adminService.createLesson({
          classroomId: selectedClass.id,
          title: scheduleForm.className,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
        nextEvent.id = saved.id;
      } else {
        await adminService.updateLesson(editingScheduleId, {
          classroomId: selectedClass.id,
          title: scheduleForm.className,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      }

      setScheduleItems((items) =>
        editingScheduleId === null ? [...items, nextEvent] : items.map((item) => (item.id === editingScheduleId ? nextEvent : item)),
      );
      setScheduleFormOpen(false);
      setNotice(editingScheduleId === null ? "Đã thêm lớp vào lịch thật." : "Đã cập nhật lịch học thật.");
    } catch {
      setScheduleItems((items) =>
        editingScheduleId === null ? [...items, nextEvent] : items.map((item) => (item.id === editingScheduleId ? nextEvent : item)),
      );
      setScheduleFormOpen(false);
      setNotice("Backend chưa sẵn sàng, đã cập nhật tạm trên giao diện.");
    }
  }

  function openCreateClassForm() {
    setClassForm(createClassFormState());
    setClassFormOpen(true);
  }

  async function handleClassSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const teacher = teacherItems.find((item) => item.fullname === classForm.teacher);
    const fallbackClass: ClassroomOverview = {
      name: classForm.name,
      teacher: classForm.teacher || "Chưa phân công",
      students: classForm.students,
      tuition: classForm.tuition,
      status: classForm.status,
    };

    try {
      const saved = await classesService.createClass({
        name: classForm.name,
        teacherId: teacher?.id ?? null,
        tuitionFee: parseCurrency(classForm.tuition),
      });
      setClassItems((items) => [
        {
          id: saved.id,
          name: saved.name,
          teacher: saved.teacherName ?? (classForm.teacher || "Chưa phân công"),
          students: saved.studentsCount ?? 0,
          tuition: `${Number(saved.tuitionFee).toLocaleString("vi-VN")}đ`,
          status: saved.teacherId ? "Active" : "Scheduling",
        },
        ...items,
      ]);
      setNotice(`Đã thêm lớp ${saved.name} từ backend.`);
    } catch {
      setClassItems((items) => [fallbackClass, ...items]);
      setNotice(`Backend chưa sẵn sàng, đã thêm tạm lớp ${classForm.name}.`);
    }
    setClassFormOpen(false);
  }

  function openCreateStudentForm() {
    setStudentForm(createStudentFormState(classItems[0]?.name ?? ""));
    setStudentFormOpen(true);
  }

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedClass = classItems.find((classroom) => classroom.name === studentForm.className);
    try {
      if (selectedClass?.id) {
        await guestService.registerClass(selectedClass.id, {
          childDob: studentForm.dob,
          childName: studentForm.name,
          note: "Tạo từ admin",
          parentName: studentForm.parent,
          parentPhone: studentForm.parentPhone,
        });
      }
      setNotice(`Đã thêm học viên ${studentForm.name} lên backend.`);
    } catch {
      setNotice(`Backend chưa sẵn sàng, đã thêm tạm học viên ${studentForm.name}.`);
    }
    setStudentItems((items) => [studentForm, ...items]);
    setStudentFormOpen(false);
  }

  function openCreateRegistrationForm() {
    setRegistrationForm(createRegistrationFormState(classItems[0]?.name ?? ""));
    setRegistrationFormOpen(true);
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedClass = classItems.find((classroom) => classroom.name === registrationForm.requestedClass);
    if (selectedClass?.id) {
      try {
        await guestService.registerClass(selectedClass.id, {
          childDob: registrationForm.childDob,
          childName: registrationForm.childName,
          note: "Tạo từ admin",
          parentName: registrationForm.parentName,
          parentPhone: registrationForm.phone,
        });
        setNotice(`Đã gửi đăng ký của bé ${registrationForm.childName} lên backend.`);
      } catch {
        setNotice(`Backend chưa sẵn sàng, đã tạo tạm đăng ký cho bé ${registrationForm.childName}.`);
      }
    }
    setRegistrationItems((items) => [
      {
        ...registrationForm,
        id: Date.now(),
        status: "new",
        submittedAt: "Vừa tạo",
      },
      ...items,
    ]);
    setRegistrationFormOpen(false);
  }

  function updateRegistrationStatus(id: number, status: RegistrationRequest["status"]) {
    setRegistrationItems((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    setNotice(status === "confirmed" ? "Đã xác nhận đăng ký." : "Đã cập nhật trạng thái đăng ký.");
  }

  function openCreateTeacherForm() {
    setTeacherName("");
    setTeacherFormOpen(true);
  }

  async function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teacherName.trim()) {
      return;
    }
    try {
      const teacher = await adminService.createTeacher({ fullname: teacherName.trim(), phone: null });
      setTeacherItems((items) => [teacher, ...items]);
      setNotice("Đã thêm giáo viên mới lên backend.");
    } catch {
      setTeacherItems((items) => [{ id: Date.now(), fullname: teacherName.trim(), phone: null, classesCount: 0 }, ...items]);
      setNotice("Backend chưa sẵn sàng, đã thêm tạm giáo viên mới.");
    }
    setTeacherName("");
    setTeacherFormOpen(false);
  }

  function toggleSetupTask(label: string) {
    setSetupItems((items) => items.map((item) => (item.label === label ? { ...item, done: !item.done } : item)));
    setNotice("Đã cập nhật checklist.");
  }

  function resetFilters() {
    setClassKeyword("");
    setClassStatus("all");
    setStudentKeyword("");
    setStudentClass("all");
    setRegistrationKeyword("");
    setRegistrationStatus("all");
    setScheduleTeacher("all");
    setScheduleRoom("all");
    setScheduleStatus("all");
    setNotice("Đã đặt lại bộ lọc.");
  }

  const isScheduleTab = activeTab === "schedule";

  return (
    <main className="min-h-screen bg-[#fbf6f1] text-[#2d211b]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1680px] gap-4 px-3 py-3 md:px-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:p-5">
        <aside className="flex flex-col rounded-3xl border border-[#ead8ca] bg-white/90 p-4 shadow-[0_20px_60px_rgba(123,82,52,0.10)] xl:sticky xl:top-5 xl:h-[calc(100vh-40px)] xl:min-h-0">
          <div className="flex items-center justify-between gap-3 xl:block">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-[#8b5632]">An Nhiên Kids</p>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">Khu quản lý</p>
            </div>
            <a
              className="rounded-full border border-[#d9bda8] px-4 py-2 text-sm font-bold text-[#6f4b34] transition hover:bg-[#fff5ed] xl:mt-4 xl:inline-flex"
              href="/guest"
            >
              Cổng phụ huynh
            </a>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0">
            {adminTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  className={`flex min-w-[160px] items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition xl:min-w-0 ${
                    isActive
                      ? "bg-[#a36c45] text-white shadow-[0_12px_24px_rgba(163,108,69,0.20)]"
                      : "bg-[#fffaf5] text-[#6f4b34] hover:bg-[#f7e6d8]"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full ${isActive ? "bg-white/18" : "bg-white"}`}>
                    <AdminTabIcon name={tab.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold leading-5">{tab.label}</span>
                    <span className={`hidden text-[11px] leading-5 xl:block ${isActive ? "text-white/78" : "text-[#8b6a58]"}`}>
                      {tab.helper}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className={`min-w-0 rounded-3xl border border-[#ead8ca] bg-white/88 shadow-[0_20px_60px_rgba(123,82,52,0.10)] ${isScheduleTab ? "xl:h-[calc(100vh-40px)] xl:overflow-hidden" : ""}`}>
          <div className={isScheduleTab ? "h-full p-3 md:p-4" : "p-4 md:p-5"}>
            {activeTab === "overview" ? (
              <OverviewPanel
                classes={classItems}
                metrics={metrics}
                onGoToRegistrations={() => setActiveTab("registrations")}
                onGoToSchedule={() => setActiveTab("schedule")}
                onResetFilters={resetFilters}
                registrations={registrationItems}
                students={studentItems}
              />
            ) : null}

            {activeTab === "schedule" ? (
              <SchedulePanel
                events={filteredScheduleItems}
                onChangeView={(view) => {
                  setScheduleView(view);
                  setNotice(view === "week" ? "Đang xem lịch tuần." : view === "day" ? "Đang xem lịch ngày." : "Đang xem lịch tháng.");
                }}
                onCreate={openCreateScheduleForm}
                onEdit={openEditScheduleForm}
                onNext={() => {
                  setWeekOffset((offset) => offset + 1);
                  setNotice("Đã chuyển sang tuần tiếp theo.");
                }}
                onPrevious={() => {
                  setWeekOffset((offset) => offset - 1);
                  setNotice("Đã quay lại tuần trước.");
                }}
                onRoomChange={setScheduleRoom}
                onStatusChange={setScheduleStatus}
                onToday={() => {
                  setWeekOffset(0);
                  setNotice("Đã quay về tuần hiện tại.");
                }}
                onTeacherChange={setScheduleTeacher}
                room={scheduleRoom}
                rooms={scheduleRooms}
                status={scheduleStatus}
                teacher={scheduleTeacher}
                teachers={scheduleTeachers}
                view={scheduleView}
                weekLabel={formatWeekLabel(weekOffset)}
              />
            ) : null}

            {activeTab === "classes" ? (
              <ClassesPanel
                classKeyword={classKeyword}
                classStatus={classStatus}
                classes={filteredClasses}
                onAdd={openCreateClassForm}
                onKeywordChange={setClassKeyword}
                onReset={resetFilters}
                onStatusChange={setClassStatus}
                onViewAll={() => {
                  setClassKeyword("");
                  setClassStatus("all");
                  setNotice("Đang hiển thị toàn bộ lớp học.");
                }}
              />
            ) : null}

            {activeTab === "students" ? (
              <StudentsPanel
                classNames={classNames}
                classValue={studentClass}
                keyword={studentKeyword}
                onAdd={openCreateStudentForm}
                onClassChange={setStudentClass}
                onKeywordChange={setStudentKeyword}
                onReset={resetFilters}
                students={filteredStudents}
              />
            ) : null}

            {activeTab === "registrations" ? (
              <RegistrationsPanel
                keyword={registrationKeyword}
                onAdd={openCreateRegistrationForm}
                onKeywordChange={setRegistrationKeyword}
                onReset={resetFilters}
                onStatusChange={setRegistrationStatus}
                onUpdateStatus={updateRegistrationStatus}
                requests={filteredRegistrations}
                status={registrationStatus}
              />
            ) : null}

            {activeTab === "teachers" ? (
              <TeachersPanel
                onAdd={openCreateTeacherForm}
                onViewSchedule={(teacher) => {
                  setScheduleTeacher(teacher);
                  setActiveTab("schedule");
                  setNotice(`Đang xem lịch của ${teacher}.`);
                }}
                teachers={teacherItems}
              />
            ) : null}
            {activeTab === "setup" ? (
              <SetupPanel onToggle={toggleSetupTask} tasks={setupItems} />
            ) : null}
          </div>
        </section>
      </div>

      {scheduleFormOpen ? (
        <ScheduleFormModal
          classes={classes}
          editing={editingScheduleId !== null}
          form={scheduleForm}
          onChange={setScheduleForm}
          onClose={() => setScheduleFormOpen(false)}
          onSubmit={handleScheduleSubmit}
        />
      ) : null}
      {classFormOpen ? (
        <ClassFormModal form={classForm} onChange={setClassForm} onClose={() => setClassFormOpen(false)} onSubmit={handleClassSubmit} />
      ) : null}
      {studentFormOpen ? (
        <StudentFormModal
          classNames={classItems.map((classroom) => classroom.name)}
          form={studentForm}
          onChange={setStudentForm}
          onClose={() => setStudentFormOpen(false)}
          onSubmit={handleStudentSubmit}
        />
      ) : null}
      {registrationFormOpen ? (
        <RegistrationFormModal
          classNames={classItems.map((classroom) => classroom.name)}
          form={registrationForm}
          onChange={setRegistrationForm}
          onClose={() => setRegistrationFormOpen(false)}
          onSubmit={handleRegistrationSubmit}
        />
      ) : null}
      {teacherFormOpen ? (
        <TeacherFormModal
          name={teacherName}
          onChange={setTeacherName}
          onClose={() => setTeacherFormOpen(false)}
          onSubmit={handleTeacherSubmit}
        />
      ) : null}
      <div className="fixed bottom-4 right-4 z-40 rounded-full border border-[#ead8ca] bg-white px-4 py-2 text-sm font-bold text-[#6f4b34] shadow-[0_12px_30px_rgba(123,82,52,0.16)]">
        {notice}
      </div>
    </main>
  );
}

function createScheduleFormState(className: string): ScheduleFormState {
  return {
    className,
    dayIndex: 0,
    durationHours: 2,
    repeatType: "fixed",
    room: defaultRoom,
    startHour: 8,
    status: "draft",
  };
}

function createClassFormState(): ClassFormState {
  return {
    name: "",
    teacher: "",
    students: 0,
    tuition: "",
    status: "Scheduling",
  };
}

function createStudentFormState(className: string): StudentFormState {
  return {
    className,
    dob: "",
    name: "",
    parent: "",
    parentPhone: "",
  };
}

function createRegistrationFormState(className: string): RegistrationFormState {
  return {
    childDob: "",
    childName: "",
    parentName: "",
    phone: "",
    requestedClass: className,
  };
}

function formatWeekLabel(offset: number) {
  if (offset === 0) {
    return "8 - 14 Thg 7, 2026";
  }

  if (offset > 0) {
    return `Tuần sau +${offset}`;
  }

  return `Tuần trước ${Math.abs(offset)}`;
}

function buildLessonDate(dayIndex: number, startHour: number) {
  const baseMonday = new Date("2026-07-06T00:00:00");
  baseMonday.setDate(baseMonday.getDate() + dayIndex);
  baseMonday.setHours(startHour, 0, 0, 0);
  return baseMonday;
}

function parseCurrency(value: string) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function AdminTabIcon({ name }: { name: (typeof adminTabs)[number]["icon"] }) {
  const commonProps = {
    className: "size-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "calendar") {
    return (
      <svg {...commonProps}>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
        <rect height="18" rx="3" width="18" x="3" y="4" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg {...commonProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "clipboard") {
    return (
      <svg {...commonProps}>
        <rect height="18" rx="2" width="16" x="4" y="4" />
        <path d="M9 2h6v4H9z" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    );
  }

  if (name === "teacher") {
    return (
      <svg {...commonProps}>
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5" />
        <path d="M22 10v6" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 5 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 5a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.36.3.74.5 1.1.6h.5a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.4z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect height="7" rx="1.5" width="7" x="3" y="3" />
      <rect height="7" rx="1.5" width="7" x="14" y="3" />
      <rect height="7" rx="1.5" width="7" x="14" y="14" />
      <rect height="7" rx="1.5" width="7" x="3" y="14" />
    </svg>
  );
}

function PanelHeader({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#725e51]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function OverviewPanel({
  classes,
  metrics,
  onGoToRegistrations,
  onGoToSchedule,
  onResetFilters,
  registrations,
  students,
}: {
  classes: ClassroomOverview[];
  metrics: SummaryMetric[];
  onGoToRegistrations: () => void;
  onGoToSchedule: () => void;
  onResetFilters: () => void;
  registrations: RegistrationRequest[];
  students: RecentStudent[];
}) {
  const newRegistrations = registrations.filter((request) => request.status === "new").length;
  const schedulingClasses = classes.filter((classroom) => classroom.status === "Scheduling").length;

  return (
    <div className="grid gap-5">
      <PanelHeader
        action={
          <button
            className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f7e6d8]"
            onClick={onResetFilters}
            type="button"
          >
            Làm mới bộ lọc
          </button>
        }
        description="Theo dõi nhanh đăng ký, lớp học, lịch và học viên."
        title="Tổng quan"
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">Bảng điều hành</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
            Hôm nay cần xử lý {newRegistrations} đăng ký mới và {schedulingClasses} lớp chờ xếp lịch.
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <QuickAction onClick={onGoToRegistrations} title="Duyệt đăng ký" value={`${newRegistrations} hồ sơ`} />
            <QuickAction onClick={onGoToSchedule} title="Xếp lịch" value={`${schedulingClasses} lớp`} />
            <QuickAction onClick={onResetFilters} title="Làm mới dữ liệu" value="Reset lọc" />
          </div>
        </div>

        <div className="rounded-3xl border border-[#ead8ca] bg-white p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">Hoạt động gần đây</p>
          <div className="mt-4 grid gap-3">
            <ActivityLine title="Phụ huynh gửi đăng ký" description="Minh Anh muốn tham gia Yoga nền tảng buổi sáng." />
            <ActivityLine title="Lớp gần đầy chỗ" description="Yoga nền tảng buổi sáng còn 6 chỗ." />
            <ActivityLine title="Lịch cần kiểm tra" description="Thiền kể chuyện đang báo trùng phòng." />
          </div>
        </div>
      </section>

      <SummaryCards metrics={metrics} />

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <ClassesTable classes={classes} onViewAll={onGoToSchedule} viewAllLabel="Xếp lịch" />
        <RecentStudents students={students} />
      </section>
    </div>
  );
}

function QuickAction({ onClick, title, value }: { onClick: () => void; title: string; value: string }) {
  return (
    <button className="rounded-2xl border border-[#ead8ca] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#fff5ed]" onClick={onClick} type="button">
      <p className="text-sm font-bold text-[#725e51]">{title}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </button>
  );
}

function ActivityLine({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl bg-[#fff5ed] p-4">
      <p className="font-extrabold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#725e51]">{description}</p>
    </div>
  );
}

function SchedulePanel({
  events,
  onChangeView,
  onCreate,
  onEdit,
  onNext,
  onPrevious,
  onRoomChange,
  onStatusChange,
  onToday,
  onTeacherChange,
  room,
  rooms,
  status,
  teacher,
  teachers,
  view,
  weekLabel,
}: {
  events: ScheduleEvent[];
  onChangeView: (view: ScheduleView) => void;
  onCreate: () => void;
  onEdit: (event: ScheduleEvent) => void;
  onNext: () => void;
  onPrevious: () => void;
  onRoomChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToday: () => void;
  onTeacherChange: (value: string) => void;
  room: string;
  rooms: string[];
  status: string;
  teacher: string;
  teachers: string[];
  view: ScheduleView;
  weekLabel: string;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <div className="grid gap-3 rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <SelectFilter
          compact
          label="Giáo viên"
          onChange={onTeacherChange}
          options={[{ label: "Tất cả", value: "all" }, ...teachers.map((item) => ({ label: item, value: item }))]}
          value={teacher}
        />
        <SelectFilter
          compact
          label="Phòng học"
          onChange={onRoomChange}
          options={[{ label: "Tất cả", value: "all" }, ...rooms.map((item) => ({ label: item, value: item }))]}
          value={room}
        />
        <SelectFilter
          compact
          label="Trạng thái"
          onChange={onStatusChange}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Đã chốt", value: "confirmed" },
            { label: "Nháp", value: "draft" },
            { label: "Trùng lịch", value: "conflict" },
          ]}
          value={status}
        />
        <button
          className="h-10 self-end rounded-full bg-[#a36c45] px-4 text-sm font-extrabold text-white transition hover:bg-[#8b5632]"
          onClick={onCreate}
          type="button"
        >
          Thêm lớp
        </button>
      </div>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] rounded-3xl border border-[#ead8ca] bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button className="grid size-9 place-items-center rounded-full border border-[#d9bda8] bg-white text-lg font-bold text-[#6f4b34]" onClick={onPrevious} type="button">{"<"}</button>
            <button className="h-9 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34]" onClick={onToday} type="button">
              Hôm nay
            </button>
            <button className="grid size-9 place-items-center rounded-full border border-[#d9bda8] bg-white text-lg font-bold text-[#6f4b34]" onClick={onNext} type="button">{">"}</button>
          </div>
          <p className="text-base font-extrabold">{weekLabel}</p>
          <div className="flex rounded-full border border-[#d9bda8] bg-[#fffaf5] p-1 text-sm font-bold">
            <button className={`rounded-full px-3 py-1.5 ${view === "day" ? "bg-[#a36c45] text-white" : "text-[#8b6a58]"}`} onClick={() => onChangeView("day")} type="button">Ngày</button>
            <button className={`rounded-full px-3 py-1.5 ${view === "week" ? "bg-[#a36c45] text-white" : "text-[#8b6a58]"}`} onClick={() => onChangeView("week")} type="button">Tuần</button>
            <button className={`rounded-full px-3 py-1.5 ${view === "month" ? "bg-[#a36c45] text-white" : "text-[#8b6a58]"}`} onClick={() => onChangeView("month")} type="button">Tháng</button>
          </div>
        </div>

        <div className="min-h-0 overflow-x-auto overflow-y-hidden">
          <div
            className="relative grid h-full min-h-[620px] min-w-[980px] overflow-hidden rounded-2xl border border-[#f0ded1] xl:min-h-0"
            style={{
              gridTemplateColumns: "54px repeat(7, minmax(126px, 1fr))",
              gridTemplateRows: `36px repeat(${timeSlots.length}, minmax(40px, 1fr))`,
            }}
          >
            <div className="border-b border-r border-[#f0ded1] bg-[#fffaf5]" />
            {dayLabels.map((day, dayIndex) => (
              <div
                className="grid place-items-center border-b border-r border-[#f0ded1] bg-[#fffaf5] text-xs font-extrabold uppercase text-[#8b6a58]"
                key={day}
                style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
              >
                {day}
              </div>
            ))}
            {timeSlots.map((hour, hourIndex) => (
              <div
                className="border-b border-r border-[#f0ded1] bg-white px-2 py-2 text-xs font-semibold text-[#8b6a58]"
                key={hour}
                style={{ gridColumn: 1, gridRow: hourIndex + 2 }}
              >
                {`${String(hour).padStart(2, "0")}:00`}
              </div>
            ))}
            {timeSlots.flatMap((hour, hourIndex) =>
              dayLabels.map((day, dayIndex) => (
                <div
                  className="border-b border-r border-[#f0ded1] bg-white"
                  key={`${day}-${hour}`}
                  style={{ gridColumn: dayIndex + 2, gridRow: hourIndex + 2 }}
                />
              )),
            )}
            {events.map((event) => (
              <button
                className="z-10 m-1 min-h-0 overflow-hidden rounded-xl p-2 text-left text-white shadow-[0_10px_20px_rgba(123,82,52,0.18)] transition hover:-translate-y-0.5"
                key={event.id}
                onClick={() => onEdit(event)}
                style={{
                  backgroundColor: event.color,
                  gridColumn: event.dayIndex + 2,
                  gridRow: `${event.startHour - 5} / span ${event.durationHours}`,
                }}
                type="button"
              >
                <div className="flex min-w-0 items-start justify-between gap-1.5">
                  <p className="min-w-0 text-sm font-extrabold leading-5">
                    {`${String(event.startHour).padStart(2, "0")}:00 - ${String(event.startHour + event.durationHours).padStart(2, "0")}:00`}
                  </p>
                  <span className="shrink-0 rounded-full bg-white/24 px-1.5 py-0.5 text-[10px] font-bold leading-4">
                    {repeatTypeLabels[event.repeatType]}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs font-bold leading-4">{event.className}</p>
                <p className="mt-0.5 truncate text-[11px] leading-4 text-white/86">
                  {event.teacher} · {event.room}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleFormModal({
  classes,
  editing,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  classes: ClassroomOverview[];
  editing: boolean;
  form: ScheduleFormState;
  onChange: (form: ScheduleFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2d211b]/35 px-4 py-6">
      <form className="w-full max-w-2xl rounded-3xl border border-[#ead8ca] bg-white p-5 shadow-2xl" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">
              {editing ? "Sửa lịch học" : "Thêm lớp vào lịch"}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">Thông tin buổi học</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-[#d9bda8] text-xl font-bold text-[#6f4b34]" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34] md:col-span-2">
            Tên lớp
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, className: event.target.value })}
              value={form.className}
            >
              {classes.map((classroom) => (
                <option key={classroom.name} value={classroom.name}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Ngày học
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, dayIndex: Number(event.target.value) })}
              value={form.dayIndex}
            >
              {dayLabels.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Giờ bắt đầu
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, startHour: Number(event.target.value) })}
              value={form.startHour}
            >
              {timeSlots.slice(0, -1).map((hour) => (
                <option key={hour} value={hour}>
                  {`${String(hour).padStart(2, "0")}:00`}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Thời lượng
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, durationHours: Number(event.target.value) })}
              value={form.durationHours}
            >
              <option value={1}>1 giờ</option>
              <option value={2}>2 giờ</option>
              <option value={3}>3 giờ</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Phòng học
            <input
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, room: event.target.value })}
              value={form.room}
            />
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Kiểu lịch
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, repeatType: event.target.value as ScheduleEvent["repeatType"] })}
              value={form.repeatType}
            >
              <option value="fixed">Cố định hằng tuần</option>
              <option value="temporary">Chỉ tạm thời ngày hôm đó</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Trạng thái
            <select
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => onChange({ ...form, status: event.target.value as ScheduleEvent["status"] })}
              value={form.status}
            >
              <option value="confirmed">Đã chốt</option>
              <option value="draft">Nháp</option>
              <option value="conflict">Trùng lịch</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="h-11 rounded-full border border-[#d9bda8] px-5 text-sm font-extrabold text-[#6f4b34]" onClick={onClose} type="button">
            Hủy
          </button>
          <button className="h-11 rounded-full bg-[#a36c45] px-5 text-sm font-extrabold text-white" type="submit">
            {editing ? "Lưu thay đổi" : "Thêm vào lịch"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ClassFormModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: ClassFormState;
  onChange: (form: ClassFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal onClose={onClose} subtitle="Thêm lớp học" title="Thông tin lớp">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField label="Tên lớp" onChange={(value) => onChange({ ...form, name: value })} required value={form.name} />
        <TextField label="Giáo viên" onChange={(value) => onChange({ ...form, teacher: value })} required value={form.teacher} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Số học viên
            <input
              className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              min={0}
              onChange={(event) => onChange({ ...form, students: Number(event.target.value) })}
              type="number"
              value={form.students}
            />
          </label>
          <TextField label="Học phí" onChange={(value) => onChange({ ...form, tuition: value })} placeholder="2.000.000đ" required value={form.tuition} />
        </div>
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Trạng thái
          <select
            className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => onChange({ ...form, status: event.target.value as ClassroomOverview["status"] })}
            value={form.status}
          >
            <option value="Active">Đang mở</option>
            <option value="Scheduling">Đang xếp lịch</option>
            <option value="Paused">Tạm dừng</option>
          </select>
        </label>
        <ModalActions onClose={onClose} submitLabel="Thêm lớp" />
      </form>
    </AdminModal>
  );
}

function StudentFormModal({
  classNames,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  classNames: string[];
  form: StudentFormState;
  onChange: (form: StudentFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal onClose={onClose} subtitle="Thêm học viên" title="Thông tin học viên">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField label="Tên con" onChange={(value) => onChange({ ...form, name: value })} required value={form.name} />
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Ngày sinh của con
          <input
            className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => onChange({ ...form, dob: event.target.value })}
            required
            type="date"
            value={form.dob}
          />
        </label>
        <TextField label="Phụ huynh" onChange={(value) => onChange({ ...form, parent: value })} required value={form.parent} />
        <TextField label="Số điện thoại phụ huynh" onChange={(value) => onChange({ ...form, parentPhone: value })} required value={form.parentPhone} />
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Lớp học
          <select
            className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => onChange({ ...form, className: event.target.value })}
            value={form.className}
          >
            {classNames.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </label>
        <ModalActions onClose={onClose} submitLabel="Thêm học viên" />
      </form>
    </AdminModal>
  );
}

function RegistrationFormModal({
  classNames,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  classNames: string[];
  form: RegistrationFormState;
  onChange: (form: RegistrationFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal onClose={onClose} subtitle="Tạo đăng ký" title="Thông tin đăng ký">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField label="Tên con" onChange={(value) => onChange({ ...form, childName: value })} required value={form.childName} />
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Ngày sinh của con
          <input
            className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => onChange({ ...form, childDob: event.target.value })}
            required
            type="date"
            value={form.childDob}
          />
        </label>
        <TextField label="Phụ huynh" onChange={(value) => onChange({ ...form, parentName: value })} required value={form.parentName} />
        <TextField label="Số điện thoại" onChange={(value) => onChange({ ...form, phone: value })} required value={form.phone} />
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Lớp muốn đăng ký
          <select
            className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => onChange({ ...form, requestedClass: event.target.value })}
            value={form.requestedClass}
          >
            {classNames.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </label>
        <ModalActions onClose={onClose} submitLabel="Tạo đăng ký" />
      </form>
    </AdminModal>
  );
}

function TeacherFormModal({
  name,
  onChange,
  onClose,
  onSubmit,
}: {
  name: string;
  onChange: (name: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal onClose={onClose} subtitle="Thêm giáo viên" title="Thông tin giáo viên">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField label="Tên giáo viên" onChange={onChange} required value={name} />
        <ModalActions onClose={onClose} submitLabel="Thêm giáo viên" />
      </form>
    </AdminModal>
  );
}

function AdminModal({
  children,
  onClose,
  subtitle,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2d211b]/35 px-4 py-6">
      <section className="w-full max-w-xl rounded-3xl border border-[#ead8ca] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">{subtitle}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{title}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-[#d9bda8] text-xl font-bold text-[#6f4b34]" onClick={onClose} type="button">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
      {label}
      <input
        className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button className="h-11 rounded-full border border-[#d9bda8] px-5 text-sm font-extrabold text-[#6f4b34]" onClick={onClose} type="button">
        Hủy
      </button>
      <button className="h-11 rounded-full bg-[#a36c45] px-5 text-sm font-extrabold text-white" type="submit">
        {submitLabel}
      </button>
    </div>
  );
}

function ClassesPanel({
  classKeyword,
  classStatus,
  classes,
  onAdd,
  onKeywordChange,
  onReset,
  onStatusChange,
  onViewAll,
}: {
  classKeyword: string;
  classStatus: string;
  classes: ClassroomOverview[];
  onAdd: () => void;
  onKeywordChange: (value: string) => void;
  onReset: () => void;
  onStatusChange: (value: string) => void;
  onViewAll: () => void;
}) {
  return (
    <div className="grid gap-4">
      <PanelHeader
        action={
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f7e6d8]" onClick={onReset} type="button">
              Xóa lọc
            </button>
            <button className="h-10 rounded-full bg-[#a36c45] px-4 text-sm font-extrabold text-white transition hover:bg-[#8b5632]" onClick={onAdd} type="button">
              Thêm lớp
            </button>
          </div>
        }
        description="Tìm kiếm, lọc và thêm lớp học mới cho trung tâm."
        title="Quản lý lớp học"
      />
      <FilterBar>
        <SearchInput label="Tìm lớp" onChange={onKeywordChange} placeholder="Tên lớp hoặc giáo viên" value={classKeyword} />
        <SelectFilter
          label="Trạng thái"
          onChange={onStatusChange}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Đang mở", value: "Active" },
            { label: "Đang xếp lịch", value: "Scheduling" },
            { label: "Tạm dừng", value: "Paused" },
          ]}
          value={classStatus}
        />
      </FilterBar>
      <ClassesTable classes={classes} onViewAll={onViewAll} />
    </div>
  );
}

function StudentsPanel({
  classNames,
  classValue,
  keyword,
  onAdd,
  onClassChange,
  onKeywordChange,
  onReset,
  students,
}: {
  classNames: string[];
  classValue: string;
  keyword: string;
  onAdd: () => void;
  onClassChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onReset: () => void;
  students: RecentStudent[];
}) {
  return (
    <div className="grid gap-4">
      <PanelHeader
        action={
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f7e6d8]" onClick={onReset} type="button">
              Xóa lọc
            </button>
            <button className="h-10 rounded-full bg-[#a36c45] px-4 text-sm font-extrabold text-white transition hover:bg-[#8b5632]" onClick={onAdd} type="button">
              Thêm học viên
            </button>
          </div>
        }
        description="Quản lý hồ sơ con, lớp đang học và thông tin phụ huynh."
        title="Quản lý học viên"
      />
      <FilterBar>
        <SearchInput label="Tìm học viên" onChange={onKeywordChange} placeholder="Tên con, phụ huynh hoặc lớp" value={keyword} />
        <SelectFilter
          label="Lớp học"
          onChange={onClassChange}
          options={[{ label: "Tất cả", value: "all" }, ...classNames.map((className) => ({ label: className, value: className }))]}
          value={classValue}
        />
      </FilterBar>
      <RecentStudents students={students} />
    </div>
  );
}

function RegistrationsPanel({
  keyword,
  onAdd,
  onKeywordChange,
  onReset,
  onStatusChange,
  onUpdateStatus,
  requests,
  status,
}: {
  keyword: string;
  onAdd: () => void;
  onKeywordChange: (value: string) => void;
  onReset: () => void;
  onStatusChange: (value: string) => void;
  onUpdateStatus: (id: number, status: RegistrationRequest["status"]) => void;
  requests: RegistrationRequest[];
  status: string;
}) {
  return (
    <div className="grid gap-4">
      <PanelHeader
        action={
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f7e6d8]" onClick={onReset} type="button">
              Xóa lọc
            </button>
            <button className="h-10 rounded-full bg-[#a36c45] px-4 text-sm font-extrabold text-white transition hover:bg-[#8b5632]" onClick={onAdd} type="button">
              Tạo đăng ký
            </button>
          </div>
        }
        description="Duyệt yêu cầu từ phụ huynh và cập nhật trạng thái xử lý."
        title="Đăng ký học"
      />
      <FilterBar>
        <SearchInput label="Tìm đăng ký" onChange={onKeywordChange} placeholder="Tên con, phụ huynh, SĐT" value={keyword} />
        <SelectFilter
          label="Trạng thái"
          onChange={onStatusChange}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Mới", value: "new" },
            { label: "Đã gọi", value: "called" },
            { label: "Đã xác nhận", value: "confirmed" },
          ]}
          value={status}
        />
      </FilterBar>

      <section className="rounded-3xl border border-[#ead8ca] bg-white shadow-sm">
        <div className="border-b border-[#ead8ca] px-5 py-4">
          <h2 className="text-xl font-extrabold">Yêu cầu đăng ký</h2>
          <p className="mt-1 text-sm text-[#725e51]">Duyệt thông tin phụ huynh gửi từ cổng đăng ký.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#fff5ed] text-[#725e51]">
              <tr>
                <th className="px-5 py-3 font-bold">Con</th>
                <th className="px-5 py-3 font-bold">Phụ huynh</th>
                <th className="px-5 py-3 font-bold">Số điện thoại</th>
                <th className="px-5 py-3 font-bold">Lớp muốn đăng ký</th>
                <th className="px-5 py-3 font-bold">Thời gian</th>
                <th className="px-5 py-3 font-bold">Trạng thái</th>
                <th className="px-5 py-3 font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr className="border-t border-[#f0ded1]" key={request.id}>
                  <td className="px-5 py-4 font-extrabold">{request.childName}</td>
                  <td className="px-5 py-4 text-[#725e51]">{request.parentName}</td>
                  <td className="px-5 py-4 text-[#725e51]">{request.phone}</td>
                  <td className="px-5 py-4 text-[#725e51]">{request.requestedClass}</td>
                  <td className="px-5 py-4 text-[#725e51]">{request.submittedAt}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#f2dfcf] px-3 py-1 text-xs font-extrabold text-[#8b5632]">
                      {registrationStatusLabels[request.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-full border border-[#d9bda8] px-3 py-1 text-xs font-extrabold text-[#6f4b34] transition hover:bg-[#fff5ed]" onClick={() => onUpdateStatus(request.id, "called")} type="button">
                        Đã gọi
                      </button>
                      <button className="rounded-full bg-[#a36c45] px-3 py-1 text-xs font-extrabold text-white transition hover:bg-[#8b5632]" onClick={() => onUpdateStatus(request.id, "confirmed")} type="button">
                        Xác nhận
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TeachersPanel({
  onAdd,
  onViewSchedule,
  teachers,
}: {
  onAdd: () => void;
  onViewSchedule: (teacher: string) => void;
  teachers: Teacher[];
}) {
  return (
    <div className="grid gap-4">
      <PanelHeader
        action={
          <button className="h-10 rounded-full bg-[#a36c45] px-4 text-sm font-extrabold text-white transition hover:bg-[#8b5632]" onClick={onAdd} type="button">
            Thêm giáo viên
          </button>
        }
        description="Quản lý giáo viên, số lớp phụ trách và trạng thái lịch dạy."
        title="Quản lý giáo viên"
      />
      <section className="grid gap-4 rounded-3xl border border-[#ead8ca] bg-white p-5 shadow-sm md:grid-cols-3">
        {teachers.map((teacher) => (
          <article className="rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-5" key={teacher.id}>
            <p className="text-xl font-extrabold">{teacher.fullname}</p>
            <p className="mt-2 text-sm leading-6 text-[#725e51]">{teacher.classesCount} lớp đang phụ trách</p>
            <button
              className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-[#8b5632] transition hover:bg-[#f7e6d8]"
              onClick={() => onViewSchedule(teacher.fullname)}
              type="button"
            >
              Xem lịch tuần
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function SetupPanel({ onToggle, tasks }: { onToggle: (label: string) => void; tasks: SetupTask[] }) {
  return (
    <div className="grid gap-4">
      <PanelHeader
        action={
          <button
            className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f7e6d8]"
            onClick={() => tasks.filter((task) => !task.done).forEach((task) => onToggle(task.label))}
            type="button"
          >
            Đánh dấu xong
          </button>
        }
        description="Theo dõi các việc cần hoàn thiện trước khi bàn giao."
        title="Thiết lập hệ thống"
      />
      <section className="rounded-lg border border-[#ead8ca] bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d211b]">Việc cần hoàn thiện</h2>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          {tasks.map((task) => (
            <label className="flex items-center gap-3 text-[#2d211b]" key={task.label}>
              <input
                checked={task.done}
                className="size-4 accent-[#a36c45]"
                onChange={() => onToggle(task.label)}
                type="checkbox"
              />
              {task.label}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterBar({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-4 md:grid-cols-3">{children}</div>;
}

function SearchInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
      {label}
      <input
        className="h-11 rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function SelectFilter({
  compact = false,
  label,
  onChange,
  options,
  value,
}: {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-extrabold text-[#6f4b34]">
      {label}
      <select
        className={`${compact ? "h-10" : "h-11"} rounded-2xl border border-[#e3d6ca] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
