"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "../services/admin-service";
import type { Lesson, LessonAttendanceDetail } from "../types";

const attendanceStatusLabels: Record<LessonAttendanceDetail["status"], string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Đi muộn",
  EXCUSED: "Có phép",
};

export function TodayLessonsPanel() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKeyInVietnam);
  const [timeFilter, setTimeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [actionLessonId, setActionLessonId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [detailLesson, setDetailLesson] = useState<Lesson | null>(null);
  const [attendanceDetails, setAttendanceDetails] = useState<LessonAttendanceDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const allLocked = useMemo(
    () => lessons.length > 0 && lessons.every((lesson) => lesson.takeAttendanceStatus),
    [lessons],
  );

  const visibleLessons = useMemo(
    () => lessons.filter((lesson) => lessonMatchesTime(lesson, timeFilter)),
    [lessons, timeFilter],
  );

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      setLessons(await adminService.getLessonsByDate(selectedDate));
    } catch {
      setLessons([]);
      setNotice("Không thể tải danh sách tiết học của ngày đã chọn.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  async function openAttendanceDetails(lesson: Lesson) {
    setDetailLesson(lesson);
    setAttendanceDetails([]);
    setDetailLoading(true);
    try {
      setAttendanceDetails(await adminService.getLessonAttendances(lesson.id));
    } catch {
      setNotice("Không thể tải chi tiết điểm danh của tiết học.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleLesson(lesson: Lesson) {
    const nextLocked = !lesson.takeAttendanceStatus;
    if (nextLocked && !window.confirm(`Khóa điểm danh tiết "${lesson.title}"?`)) {
      return;
    }

    setActionLessonId(lesson.id);
    setNotice("");
    try {
      const result = await adminService.toggleLessonAttendanceStatus(lesson.id);
      setLessons((items) =>
        items.map((item) =>
          item.id === lesson.id
            ? { ...item, takeAttendanceStatus: result.takeAttendanceStatus }
            : item,
        ),
      );
      setNotice(result.takeAttendanceStatus ? "Đã khóa điểm danh tiết học." : "Đã mở lại điểm danh tiết học.");
    } catch {
      setNotice("Không thể thay đổi trạng thái điểm danh của tiết học.");
    } finally {
      setActionLessonId(null);
    }
  }

  async function toggleAllLessons() {
    const nextLocked = !allLocked;
    if (nextLocked && !window.confirm(`Khóa điểm danh toàn bộ tiết học ngày ${formatDateKey(selectedDate)}?`)) {
      return;
    }

    setBulkUpdating(true);
    setNotice("");
    try {
      const result = await adminService.toggleAttendanceStatusByDate(selectedDate);
      setLessons((items) =>
        items.map((lesson) => ({
          ...lesson,
          takeAttendanceStatus: result.takeAttendanceStatus,
        })),
      );
      setNotice(
        result.updatedLessons === 0
          ? "Ngày đã chọn không có tiết học để cập nhật."
          : result.takeAttendanceStatus
            ? `Đã khóa ${result.updatedLessons} tiết học ngày ${formatDateKey(selectedDate)}.`
            : `Đã mở lại ${result.updatedLessons} tiết học ngày ${formatDateKey(selectedDate)}.`,
      );
    } catch {
      setNotice("Không thể cập nhật toàn bộ tiết học của ngày đã chọn.");
    } finally {
      setBulkUpdating(false);
    }
  }

  return (
    <div className="grid gap-4">
      <header className="flex flex-col gap-4 rounded-3xl border border-[#ead8ca] bg-[#fffaf5] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">Quản lý điểm danh</p>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Danh sách tiết học theo ngày</h1>
          <p className="mt-2 text-sm font-bold text-[#725e51]">{formatDateKeyLong(selectedDate)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="h-11 rounded-full border border-[#d9bda8] bg-white px-5 text-sm font-extrabold text-[#6f4b34] disabled:opacity-50"
            disabled={loading || bulkUpdating}
            onClick={() => void loadLessons()}
            type="button"
          >
            Tải lại
          </button>
          <button
            className={`h-11 rounded-full px-5 text-sm font-extrabold text-white disabled:opacity-50 ${
              allLocked ? "bg-[#38825c]" : "bg-[#a83e2a]"
            }`}
            disabled={loading || bulkUpdating || lessons.length === 0}
            onClick={() => void toggleAllLessons()}
            type="button"
          >
            {bulkUpdating ? "Đang cập nhật..." : allLocked ? "Mở khóa tất cả" : "Khóa điểm danh nhanh"}
          </button>
        </div>
      </header>

      <section className="grid gap-3 rounded-3xl border border-[#ead8ca] bg-white p-4 md:grid-cols-[minmax(190px,1fr)_minmax(170px,0.7fr)_auto] md:items-end">
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Tìm theo ngày
          <input
            className="h-11 rounded-2xl border border-[#d9bda8] bg-white px-4 font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            disabled={loading || bulkUpdating}
            onChange={(event) => setSelectedDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
        </label>
        <label className="grid gap-2 text-sm font-extrabold text-[#6f4b34]">
          Lọc theo giờ đang diễn ra
          <input
            className="h-11 rounded-2xl border border-[#d9bda8] bg-white px-4 font-semibold outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
            onChange={(event) => setTimeFilter(event.target.value)}
            type="time"
            value={timeFilter}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            className="h-11 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34]"
            onClick={() => setSelectedDate((date) => moveDateKey(date, -1))}
            type="button"
          >
            Ngày trước
          </button>
          <button
            className="h-11 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34]"
            onClick={() => setSelectedDate(getTodayDateKeyInVietnam())}
            type="button"
          >
            Hôm nay
          </button>
          <button
            className="h-11 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34]"
            onClick={() => setSelectedDate((date) => moveDateKey(date, 1))}
            type="button"
          >
            Ngày sau
          </button>
          {timeFilter ? (
            <button
              className="h-11 rounded-full bg-[#fff1e5] px-4 text-sm font-extrabold text-[#8b5632]"
              onClick={() => setTimeFilter("")}
              type="button"
            >
              Xóa lọc giờ
            </button>
          ) : null}
        </div>
      </section>

      {!loading && lessons.length > 0 ? (
        <p className="text-sm font-bold text-[#725e51]">
          Hiển thị {visibleLessons.length}/{lessons.length} tiết học
          {timeFilter ? ` đang diễn ra lúc ${timeFilter}` : " trong ngày"}.
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl bg-[#fff1e5] px-4 py-3 text-sm font-bold text-[#8b5632]" role="status">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="rounded-3xl border border-[#ead8ca] bg-white p-8 text-center font-bold text-[#8b5632]">
          Đang tải tiết học của ngày đã chọn...
        </p>
      ) : null}

      {!loading && lessons.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[#d9bda8] bg-white p-8 text-center font-bold text-[#8b5632]">
          Ngày đã chọn chưa có tiết học nào.
        </p>
      ) : null}

      {!loading && lessons.length > 0 && visibleLessons.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[#d9bda8] bg-white p-8 text-center font-bold text-[#8b5632]">
          Không có tiết học nào phù hợp với giờ đang tìm.
        </p>
      ) : null}

      {!loading && visibleLessons.length > 0 ? (
        <div className="grid gap-3">
          {visibleLessons.map((lesson) => (
            <article
              className="flex flex-col gap-4 rounded-3xl border border-[#ead8ca] bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              key={lesson.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-xs font-extrabold text-[#8b5632]">
                    {formatTimeInVietnam(lesson.startTime)} - {formatTimeInVietnam(lesson.endTime)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      lesson.takeAttendanceStatus
                        ? "bg-[#fce3dd] text-[#9b3f2c]"
                        : "bg-[#e2f3e9] text-[#26704a]"
                    }`}
                  >
                    {lesson.takeAttendanceStatus ? "Đã khóa điểm danh" : "Đang mở điểm danh"}
                  </span>
                </div>
                <h2 className="mt-3 truncate text-xl font-extrabold">{lesson.title}</h2>
                <p className="mt-1 text-sm font-bold text-[#725e51]">
                  {lesson.classroomName} · {lesson.teacherName ?? "Chưa phân công giáo viên"} · {lesson.code}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  className="h-10 rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34]"
                  onClick={() => void openAttendanceDetails(lesson)}
                  type="button"
                >
                  Xem chi tiết điểm danh
                </button>
                <button
                  className={`h-10 rounded-full px-4 text-sm font-extrabold text-white disabled:opacity-50 ${
                    lesson.takeAttendanceStatus ? "bg-[#38825c]" : "bg-[#a83e2a]"
                  }`}
                  disabled={actionLessonId === lesson.id || bulkUpdating}
                  onClick={() => void toggleLesson(lesson)}
                  type="button"
                >
                  {actionLessonId === lesson.id
                    ? "Đang cập nhật..."
                    : lesson.takeAttendanceStatus
                      ? "Mở khóa điểm danh"
                      : "Khóa điểm danh"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {detailLesson ? (
        <AttendanceDetailsModal
          attendances={attendanceDetails}
          lesson={detailLesson}
          loading={detailLoading}
          onClose={() => setDetailLesson(null)}
        />
      ) : null}
    </div>
  );
}

function AttendanceDetailsModal({
  attendances,
  lesson,
  loading,
  onClose,
}: {
  attendances: LessonAttendanceDetail[];
  lesson: Lesson;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      aria-labelledby="attendance-details-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#2d211b]/55 p-3 backdrop-blur-sm"
      role="dialog"
    >
      <section className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#ead8ca] bg-[#fffaf5] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#a36c45]">Chi tiết điểm danh</p>
            <h2 className="mt-1 text-2xl font-extrabold" id="attendance-details-title">{lesson.title}</h2>
            <p className="mt-1 text-sm font-bold text-[#725e51]">
              {formatTimeInVietnam(lesson.startTime)} - {formatTimeInVietnam(lesson.endTime)} · {lesson.classroomName}
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d9bda8] text-xl font-bold"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto p-4 md:p-5">
          {loading ? <p className="py-8 text-center font-bold text-[#8b5632]">Đang tải điểm danh...</p> : null}
          {!loading && attendances.length === 0 ? (
            <p className="py-8 text-center font-bold text-[#8b5632]">Tiết học chưa có dữ liệu điểm danh.</p>
          ) : null}
          {!loading && attendances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-[#725e51]">
                  <tr>
                    <th className="px-3 py-3 font-extrabold">STT</th>
                    <th className="px-3 py-3 font-extrabold">Học sinh</th>
                    <th className="px-3 py-3 font-extrabold">Trạng thái</th>
                    <th className="px-3 py-3 font-extrabold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance, index) => (
                    <tr className="border-t border-[#f0ded1]" key={attendance.id}>
                      <td className="px-3 py-4 font-bold text-[#8b5632]">{index + 1}</td>
                      <td className="px-3 py-4 font-extrabold">{attendance.studentName}</td>
                      <td className="px-3 py-4 font-bold">{attendanceStatusLabels[attendance.status]}</td>
                      <td className="px-3 py-4 text-[#725e51]">{attendance.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function formatTimeInVietnam(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function getTodayDateKeyInVietnam() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(new Date());

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function moveDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateKeyLong(dateKey: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${dateKey}T00:00:00+07:00`));
}

function lessonMatchesTime(lesson: Lesson, timeFilter: string) {
  if (!timeFilter) {
    return true;
  }

  const [filterHour, filterMinute] = timeFilter.split(":").map(Number);
  const filterMinutes = filterHour * 60 + filterMinute;
  const startMinutes = getVietnamTimeMinutes(lesson.startTime);
  const endMinutes = getVietnamTimeMinutes(lesson.endTime);

  return endMinutes > startMinutes
    ? filterMinutes >= startMinutes && filterMinutes < endMinutes
    : filterMinutes >= startMinutes || filterMinutes < endMinutes;
}

function getVietnamTimeMinutes(value: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(new Date(value));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}
