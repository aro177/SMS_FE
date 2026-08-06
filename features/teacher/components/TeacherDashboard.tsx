"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { teacherService } from "../services/teacher-service";
import type { AttendanceStatus, AttendanceStudent, TeacherLesson, TeacherOption } from "../types";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ApiError } from "@/shared/services/api";

const attendanceOptions: { label: string; value: AttendanceStatus }[] = [
  { label: "Có mặt", value: "PRESENT" },
  { label: "Vắng", value: "ABSENT" },
];

export function TeacherDashboard() {
  const [teacher, setTeacher] = useState<TeacherOption | null>(null);
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [roster, setRoster] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [notice, setNotice] = useState("Đang tải lịch dạy hôm nay.");
  const [noteStudentId, setNoteStudentId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  const noteStudent = useMemo(
    () => roster.find((student) => student.studentId === noteStudentId) ?? null,
    [noteStudentId, roster],
  );

  const openLesson = useCallback(async (lesson: TeacherLesson, showLoading = true) => {
    setSelectedLessonId(lesson.id);
    setNoteStudentId(null);
    setNoteDraft("");
    if (showLoading) {
      setAttendanceLoading(true);
    }

    try {
      const students = await teacherService.getLessonRoster(lesson.id);
      setRoster(students.map((student) => ({ ...student, status: student.status ?? "PRESENT" })));
      setNotice(
        lesson.takeAttendanceStatus
          ? `Điểm danh tiết ${lesson.title || lesson.classroomName} đã bị khóa.`
          : `Đang điểm danh tiết ${lesson.title || lesson.classroomName}.`,
      );
    } catch {
      setRoster([]);
      setNotice("Chưa tải được danh sách học viên cho tiết này.");
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  function openNote(student: AttendanceStudent) {
    if (selectedLesson?.takeAttendanceStatus) {
      setNotice("Điểm danh của tiết học này đã bị khóa.");
      return;
    }

    setNoteStudentId(student.studentId);
    setNoteDraft(student.note ?? "");
  }

  function closeNote() {
    setNoteStudentId(null);
    setNoteDraft("");
  }

  function saveNoteDraft() {
    if (!noteStudent) {
      return;
    }

    const note = noteDraft.trim() || null;
    setRoster((items) =>
      items.map((student) => (student.studentId === noteStudent.studentId ? { ...student, note } : student)),
    );
    setNotice(`Đã lưu ghi chú nháp cho ${noteStudent.studentName}.`);
    closeNote();
  }

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const [me, todayLessons] = await Promise.all([teacherService.getMe(), teacherService.getTodayLessons()]);
      setTeacher(me);
      setLessons(todayLessons);
      setSelectedLessonId(todayLessons[0]?.id ?? null);
      setRoster([]);
      setNotice(todayLessons.length > 0 ? "Đã tải lịch dạy hôm nay." : "Hôm nay chưa có tiết dạy.");

      if (todayLessons[0]) {
        await openLesson(todayLessons[0], false);
      }
    } catch {
      setNotice("Chưa tải được lịch giáo viên. Kiểm tra tài khoản đã được gán hồ sơ giáo viên chưa.");
    } finally {
      setLoading(false);
    }
  }, [openLesson]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadToday();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadToday]);

  async function submitAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) {
      return;
    }

    if (selectedLesson.takeAttendanceStatus) {
      setNotice("Điểm danh của tiết học này đã bị khóa và không thể cập nhật.");
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
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setLessons((items) =>
          items.map((lesson) =>
            lesson.id === selectedLesson.id
              ? { ...lesson, takeAttendanceStatus: true }
              : lesson,
          ),
        );
        setNotice("Admin vừa khóa điểm danh của tiết học này. Dữ liệu không được cập nhật.");
      } else {
        setNotice("Chưa lưu được điểm danh lên backend.");
      }
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#fff8ef_0,#fbefe5_34%,#f6e7dc_100%)] p-3 text-[#2d211b] md:p-6">
      <div className="mx-auto grid max-w-[1500px] gap-4">
        <header className="rounded-3xl border border-[#ead8ca] bg-white/88 p-4 shadow-[0_18px_50px_rgba(123,82,52,0.10)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">Cổng giáo viên</p>
              <h1 className="mt-2 text-2xl font-extrabold md:text-4xl">
                {teacher ? `Lịch hôm nay của ${teacher.fullname}` : "Lịch dạy hôm nay"}
              </h1>
              <p className="mt-2 text-sm font-bold text-[#8b5632]">{notice}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="h-11 rounded-full border border-[#d9bda8] bg-white px-5 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#fff5ed]"
                disabled={loading}
                onClick={() => void loadToday()}
                type="button"
              >
                {loading ? "Đang tải..." : "Tải lại"}
              </button>
              <LogoutButton className="inline-flex h-11 items-center justify-center rounded-full bg-[#2d211b] px-5 text-sm font-extrabold text-white transition hover:bg-[#4a382f] disabled:cursor-not-allowed disabled:opacity-60" />
            </div>
          </div>
        </header>

        <section className="grid min-h-[calc(100dvh-155px)] gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="min-h-0 max-h-[34dvh] overflow-y-auto rounded-3xl border border-[#ead8ca] bg-white/88 p-4 shadow-[0_18px_50px_rgba(123,82,52,0.10)] xl:max-h-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a36c45]">Tiết học hôm nay</p>
                <p className="mt-1 text-sm font-bold text-[#725e51]">{formatDate(new Date())}</p>
              </div>
              <span className="rounded-full bg-[#fff5ed] px-3 py-1 text-sm font-extrabold text-[#8b5632]">
                {lessons.length} tiết
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {lessons.map((lesson) => {
                const selected = lesson.id === selectedLesson?.id;

                return (
                  <button
                    className={`rounded-3xl border p-4 text-left transition ${
                      selected
                        ? "border-[#a36c45] bg-[#fff1e5] shadow-[0_12px_26px_rgba(163,108,69,0.14)]"
                        : "border-[#ead8ca] bg-white hover:bg-[#fffaf5]"
                    }`}
                    key={lesson.id}
                    onClick={() => void openLesson(lesson)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-extrabold leading-snug">{lesson.title || lesson.classroomName}</p>
                      <span className="shrink-0 rounded-full bg-[#f2dfcf] px-3 py-1 text-xs font-extrabold text-[#8b5632]">
                        {formatTime(lesson.startTime)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#725e51]">
                      {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                    </p>
                    <p className="mt-1 text-sm text-[#725e51]">{lesson.classroomName}</p>
                    {lesson.takeAttendanceStatus ? (
                      <span className="mt-3 inline-flex rounded-full bg-[#fce3dd] px-3 py-1 text-xs font-extrabold text-[#9b3f2c]">
                        Đã khóa điểm danh
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {lessons.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9bda8] bg-[#fffaf5] p-6 text-center text-sm font-bold text-[#8b5632]">
                  Hôm nay chưa có tiết học nào.
                </div>
              ) : null}
            </div>
          </aside>

          <form className="min-h-0 overflow-hidden rounded-3xl border border-[#ead8ca] bg-white/88 shadow-[0_18px_50px_rgba(123,82,52,0.10)]" onSubmit={submitAttendance}>
            <div className="border-b border-[#ead8ca] bg-[#fffaf5] px-5 py-4">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a36c45]">Điểm danh</p>
              <h2 className="mt-1 text-2xl font-extrabold">
                {selectedLesson ? selectedLesson.title || selectedLesson.classroomName : "Chọn một tiết học"}
              </h2>
              {selectedLesson ? (
                <p className="mt-1 text-sm font-bold text-[#725e51]">
                  {formatTime(selectedLesson.startTime)} - {formatTime(selectedLesson.endTime)}
                </p>
              ) : null}
              {selectedLesson?.takeAttendanceStatus ? (
                <p className="mt-3 rounded-2xl bg-[#fce3dd] px-4 py-2 text-sm font-extrabold text-[#9b3f2c]">
                  Admin đã khóa điểm danh. Bạn chỉ có thể xem, không thể chỉnh sửa hoặc lưu lại.
                </p>
              ) : null}
            </div>

            <div className="max-h-[calc(100dvh-292px)] overflow-y-auto md:max-h-[calc(100dvh-305px)]">
              <div className="grid gap-3 p-3 md:hidden">
                {roster.map((student, index) => (
                  <article className="rounded-3xl border border-[#ead8ca] bg-white p-4 shadow-sm" key={student.studentId}>
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff1e5] text-sm font-extrabold text-[#8b5632]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-lg font-extrabold leading-snug">{student.studentName}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#a36c45]">Chọn trạng thái</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {attendanceOptions.map((option) => (
                        <label className="cursor-pointer" key={option.value}>
                          <input
                            checked={(student.status ?? "PRESENT") === option.value}
                            className="peer sr-only"
                            disabled={selectedLesson?.takeAttendanceStatus}
                            name={`attendance-${student.studentId}`}
                            onChange={() =>
                              setRoster((items) =>
                                items.map((item) =>
                                  item.studentId === student.studentId ? { ...item, status: option.value } : item,
                                ),
                              )
                            }
                            type="radio"
                          />
                          <span className="grid h-12 place-items-center rounded-2xl border border-[#d9bda8] bg-[#fffaf5] text-base font-extrabold text-[#6f4b34] transition peer-checked:border-[#a36c45] peer-checked:bg-[#a36c45] peer-checked:text-white">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <button
                      className={`mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm font-extrabold transition ${
                        student.note
                          ? "border-[#a36c45] bg-[#fff1e5] text-[#8b5632]"
                          : "border-[#d9bda8] bg-white text-[#6f4b34] hover:bg-[#fffaf5]"
                      }`}
                      disabled={selectedLesson?.takeAttendanceStatus}
                      onClick={() => openNote(student)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block">{student.note ? "Sửa ghi chú" : "Thêm ghi chú"}</span>
                        {student.note ? <span className="mt-0.5 block truncate text-xs font-semibold">{student.note}</span> : null}
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-lg">✎</span>
                    </button>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-white text-[#725e51] shadow-[0_1px_0_#ead8ca]">
                    <tr>
                      <th className="w-20 px-5 py-3 font-extrabold">STT</th>
                      <th className="px-5 py-3 font-extrabold">Học sinh</th>
                      <th className="w-52 px-5 py-3 text-center font-extrabold">Có mặt</th>
                      <th className="w-52 px-5 py-3 text-center font-extrabold">Vắng</th>
                      <th className="w-64 px-5 py-3 font-extrabold">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student, index) => (
                      <tr className="border-t border-[#f0ded1]" key={student.studentId}>
                        <td className="px-5 py-4 font-extrabold text-[#8b5632]">{index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="text-base font-extrabold">{student.studentName}</p>
                        </td>
                        {attendanceOptions.map((option) => (
                          <td className="px-5 py-4 text-center" key={option.value}>
                            <label className="inline-flex cursor-pointer items-center justify-center">
                              <input
                                checked={(student.status ?? "PRESENT") === option.value}
                                className="peer sr-only"
                                disabled={selectedLesson?.takeAttendanceStatus}
                                name={`attendance-table-${student.studentId}`}
                                onChange={() =>
                                  setRoster((items) =>
                                    items.map((item) =>
                                      item.studentId === student.studentId ? { ...item, status: option.value } : item,
                                    ),
                                  )
                                }
                                type="radio"
                              />
                              <span className="rounded-full border border-[#d9bda8] bg-white px-5 py-2 text-sm font-extrabold text-[#6f4b34] transition peer-checked:border-[#a36c45] peer-checked:bg-[#a36c45] peer-checked:text-white">
                                {option.label}
                              </span>
                            </label>
                          </td>
                        ))}
                        <td className="px-5 py-4">
                          <button
                            className={`flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left font-extrabold transition ${
                              student.note
                                ? "border-[#a36c45] bg-[#fff1e5] text-[#8b5632]"
                                : "border-[#d9bda8] bg-white text-[#6f4b34] hover:bg-[#fffaf5]"
                            }`}
                            disabled={selectedLesson?.takeAttendanceStatus}
                            onClick={() => openNote(student)}
                            type="button"
                          >
                            <span className="min-w-0 truncate">{student.note || "Thêm ghi chú"}</span>
                            <span aria-hidden="true" className="shrink-0 text-base">✎</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {attendanceLoading ? (
                <p className="p-6 text-center text-sm font-bold text-[#8b5632]">Đang tải danh sách học sinh...</p>
              ) : null}

              {!attendanceLoading && selectedLesson && roster.length === 0 ? (
                <p className="p-6 text-center text-sm font-bold text-[#8b5632]">
                  Tiết này chưa có học sinh active trong lớp.
                </p>
              ) : null}
            </div>

            <div className="border-t border-[#ead8ca] bg-white px-4 py-3 md:px-5 md:py-4">
              <button
                className="h-12 w-full rounded-full bg-[#2d211b] text-base font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedLesson || roster.length === 0 || selectedLesson.takeAttendanceStatus}
                type="submit"
              >
                {selectedLesson?.takeAttendanceStatus ? "Điểm danh đã bị khóa" : "Lưu điểm danh"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {noteStudent ? (
        <AttendanceNoteModal
          note={noteDraft}
          onChange={setNoteDraft}
          onClose={closeNote}
          onSave={saveNoteDraft}
          studentName={noteStudent.studentName}
        />
      ) : null}
    </main>
  );
}

function AttendanceNoteModal({
  note,
  onChange,
  onClose,
  onSave,
  studentName,
}: {
  note: string;
  onChange: (note: string) => void;
  onClose: () => void;
  onSave: () => void;
  studentName: string;
}) {
  return (
    <div
      aria-labelledby="attendance-note-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#2d211b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
    >
      <section className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[#ead8ca] bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">Ghi chú điểm danh</p>
            <h2 className="mt-1 truncate text-xl font-extrabold text-[#2d211b] sm:text-2xl" id="attendance-note-title">
              {studentName}
            </h2>
          </div>
          <button
            aria-label="Đóng ghi chú"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d9bda8] bg-white text-xl font-bold text-[#6f4b34] transition hover:bg-[#fff5ed]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <label className="mt-5 grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Nội dung ghi chú
          <textarea
            autoFocus
            className="min-h-36 resize-y rounded-2xl border border-[#e3d6ca] bg-[#fffaf5] px-4 py-3 text-base font-medium leading-6 text-[#2d211b] outline-none transition placeholder:text-[#aa9485] focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            maxLength={500}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ví dụ: Bé đến muộn 10 phút, sức khỏe chưa tốt..."
            value={note}
          />
        </label>
        <div className="mt-2 flex justify-end text-xs font-bold text-[#8b6a58]">{note.length}/500</div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="h-12 rounded-full border border-[#d9bda8] bg-white px-5 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#fff5ed]"
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-12 rounded-full bg-[#2d211b] px-5 text-sm font-extrabold text-white transition hover:bg-[#4a382f]"
            onClick={onSave}
            type="button"
          >
            Lưu ghi chú nháp
          </button>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    weekday: "long",
    year: "numeric",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
