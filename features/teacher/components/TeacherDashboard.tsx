"use client";

import { FormEvent, useMemo, useState } from "react";
import { teacherService } from "../services/teacher-service";
import type { AttendanceStatus, AttendanceStudent, TeacherLesson, TeacherOption } from "../types";

type TeacherDashboardProps = {
  teachers: TeacherOption[];
};

const statusOptions: { label: string; value: AttendanceStatus }[] = [
  { label: "Có mặt", value: "PRESENT" },
  { label: "Vắng", value: "ABSENT" },
  { label: "Đi muộn", value: "LATE" },
  { label: "Có phép", value: "EXCUSED" },
];

export function TeacherDashboard({ teachers }: TeacherDashboardProps) {
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? 0);
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [roster, setRoster] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("Chọn giáo viên để xem lịch dạy và điểm danh.");

  const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];

  const groupedLessons = useMemo(
    () =>
      lessons.reduce<Record<string, TeacherLesson[]>>((groups, lesson) => {
        const key = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          weekday: "long",
        }).format(new Date(lesson.startTime));
        groups[key] = [...(groups[key] ?? []), lesson];
        return groups;
      }, {}),
    [lessons],
  );

  async function loadLessons(nextTeacherId = teacherId) {
    if (!nextTeacherId) {
      return;
    }

    setLoading(true);
    try {
      const items = await teacherService.getLessons(nextTeacherId);
      setLessons(items);
      setSelectedLessonId(items[0]?.id ?? null);
      setRoster([]);
      setNotice(items.length > 0 ? "Đã tải lịch dạy." : "Giáo viên này chưa có lịch dạy.");
    } catch {
      setNotice("Chưa tải được lịch dạy từ backend.");
    } finally {
      setLoading(false);
    }
  }

  async function openLesson(lesson: TeacherLesson) {
    setSelectedLessonId(lesson.id);
    setLoading(true);
    try {
      const students = await teacherService.getLessonRoster(lesson.id);
      setRoster(students.map((student) => ({ ...student, status: student.status ?? "PRESENT" })));
      setNotice(`Đang điểm danh tiết ${lesson.title}.`);
    } catch {
      setRoster([]);
      setNotice("Chưa tải được danh sách học viên cho tiết này.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) {
      return;
    }

    try {
      await teacherService.markLesson(
        selectedLesson.id,
        roster.map((student) => ({
          note: student.note,
          status: student.status ?? "PRESENT",
          studentId: student.studentId,
        })),
      );
      setNotice("Đã lưu điểm danh cho tiết học.");
    } catch {
      setNotice("Chưa lưu được điểm danh lên backend.");
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#fff8ef_0,#fbefe5_34%,#f6e7dc_100%)] p-4 text-[#2d211b] md:p-6">
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-[#ead8ca] bg-white/85 p-5 shadow-[0_18px_50px_rgba(123,82,52,0.10)]">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">Cổng giáo viên</p>
          <h1 className="mt-2 text-3xl font-extrabold">Lịch dạy & điểm danh</h1>
          <p className="mt-3 text-sm leading-6 text-[#725e51]">
            Xem lịch theo giáo viên, mở từng tiết để điểm danh chi tiết.
          </p>

          <label className="mt-6 grid gap-2 text-sm font-extrabold text-[#6f4b34]">
            Giáo viên
            <select
              className="h-12 rounded-2xl border border-[#d9bda8] bg-[#fffaf5] px-4 text-base font-bold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
              onChange={(event) => {
                const nextId = Number(event.target.value);
                setTeacherId(nextId);
                void loadLessons(nextId);
              }}
              value={teacherId}
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullname}
                </option>
              ))}
            </select>
          </label>

          <button
            className="mt-4 h-12 w-full rounded-full bg-[#a36c45] text-base font-extrabold text-white transition hover:bg-[#8b5632]"
            disabled={loading || !teacherId}
            onClick={() => void loadLessons()}
            type="button"
          >
            {loading ? "Đang tải..." : "Tải lịch dạy"}
          </button>

          <a className="mt-4 inline-flex text-sm font-extrabold text-[#8b5632] hover:underline" href="/guest">
            Về cổng phụ huynh
          </a>
        </aside>

        <section className="grid min-h-[calc(100dvh-48px)] gap-4 lg:grid-rows-[auto_minmax(0,1fr)]">
          <header className="rounded-3xl border border-[#ead8ca] bg-white/85 p-5 shadow-[0_18px_50px_rgba(123,82,52,0.10)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
              {selectedTeacher?.fullname ?? "Chưa chọn giáo viên"}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">Theo dõi từng tiết học</h2>
            <p className="mt-2 text-sm font-bold text-[#8b5632]">{notice}</p>
          </header>

          <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
            <div className="min-h-0 overflow-y-auto rounded-3xl border border-[#ead8ca] bg-white/85 p-4">
              <div className="grid gap-3">
                {Object.entries(groupedLessons).map(([day, items]) => (
                  <section className="rounded-3xl bg-[#fffaf5] p-4" key={day}>
                    <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#a36c45]">{day}</p>
                    <div className="mt-3 grid gap-2">
                      {items.map((lesson) => (
                        <button
                          className={`rounded-2xl border p-4 text-left transition ${
                            selectedLesson?.id === lesson.id
                              ? "border-[#a36c45] bg-[#fff1e5]"
                              : "border-[#ead8ca] bg-white hover:bg-[#fff5ed]"
                          }`}
                          key={lesson.id}
                          onClick={() => void openLesson(lesson)}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-lg font-extrabold">{lesson.title}</p>
                            <span className="rounded-full bg-[#f2dfcf] px-3 py-1 text-xs font-extrabold text-[#8b5632]">
                              {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-[#725e51]">{lesson.classroomName}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                {lessons.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#d9bda8] p-8 text-center font-bold text-[#8b5632]">
                    Chưa có lịch. Bấm tải lịch dạy sau khi chọn giáo viên.
                  </div>
                ) : null}
              </div>
            </div>

            <form className="min-h-0 overflow-y-auto rounded-3xl border border-[#ead8ca] bg-white/85 p-4" onSubmit={submitAttendance}>
              <div className="sticky top-0 z-10 bg-white/95 pb-3">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a36c45]">Điểm danh tiết</p>
                <h3 className="mt-1 text-2xl font-extrabold">{selectedLesson?.title ?? "Chưa chọn tiết"}</h3>
              </div>

              <div className="mt-3 grid gap-3">
                {roster.map((student) => (
                  <div className="rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-4" key={student.studentId}>
                    <p className="text-lg font-extrabold">{student.studentName}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      {statusOptions.map((option) => (
                        <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold" key={option.value}>
                          <input
                            checked={(student.status ?? "PRESENT") === option.value}
                            onChange={() =>
                              setRoster((items) =>
                                items.map((item) =>
                                  item.studentId === student.studentId ? { ...item, status: option.value } : item,
                                ),
                              )
                            }
                            type="radio"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    <input
                      className="mt-3 h-11 w-full rounded-2xl border border-[#ead8ca] bg-white px-4 text-sm outline-none focus:border-[#a36c45]"
                      onChange={(event) =>
                        setRoster((items) =>
                          items.map((item) =>
                            item.studentId === student.studentId ? { ...item, note: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Ghi chú nếu cần"
                      value={student.note ?? ""}
                    />
                  </div>
                ))}
                {roster.length === 0 ? (
                  <p className="rounded-3xl bg-[#fffaf5] p-6 text-sm font-bold text-[#8b5632]">
                    Chọn một tiết học để tải danh sách học viên.
                  </p>
                ) : null}
              </div>

              <button
                className="mt-4 h-12 w-full rounded-full bg-[#2d211b] text-base font-extrabold text-white transition hover:-translate-y-0.5"
                disabled={!selectedLesson || roster.length === 0}
                type="submit"
              >
                Lưu điểm danh
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
