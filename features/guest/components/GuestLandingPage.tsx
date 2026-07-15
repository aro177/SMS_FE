"use client";

import { FormEvent, useMemo, useState } from "react";
import type { AttendanceHistoryItem, ChildSearchResult, ClassRegistrationForm, PublicClass } from "../types";
import { guestService } from "../services/guest-service";

type GuestLandingPageProps = {
  classes: PublicClass[];
  childResults: ChildSearchResult[];
};

type GuestTab = "classes" | "search";
type SubjectFilter = "all" | string;
type AgeFilter = "all" | string;
type PriceFilter = "all" | PublicClass["priceTier"];

const CLASSES_PER_PAGE = 3;

const emptyRegistrationForm: ClassRegistrationForm = {
  childName: "",
  childDob: "",
  parentName: "",
  parentPhone: "",
  note: "",
};

export function GuestLandingPage({ classes, childResults }: GuestLandingPageProps) {
  const [activeTab, setActiveTab] = useState<GuestTab>("classes");
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? 0);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [classPage, setClassPage] = useState(0);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState(emptyRegistrationForm);
  const [registrationSent, setRegistrationSent] = useState(false);
  const [registrationSending, setRegistrationSending] = useState(false);
  const [parentPhone, setParentPhone] = useState("");
  const [childDob, setChildDob] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [apiChildResults, setApiChildResults] = useState<ChildSearchResult[] | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryItem[]>([]);

  const filteredClasses = useMemo(
    () =>
      classes.filter((classroom) => {
        const matchSubject = subjectFilter === "all" || classroom.subject === subjectFilter;
        const matchAge = ageFilter === "all" || classroom.ageGroup === ageFilter;
        const matchPrice = priceFilter === "all" || classroom.priceTier === priceFilter;

        return matchSubject && matchAge && matchPrice;
      }),
    [ageFilter, classes, priceFilter, subjectFilter],
  );

  const totalClassPages = Math.max(1, Math.ceil(filteredClasses.length / CLASSES_PER_PAGE));
  const safeClassPage = Math.min(classPage, totalClassPages - 1);
  const pageStart = safeClassPage * CLASSES_PER_PAGE;
  const visibleClasses = filteredClasses.slice(pageStart, pageStart + CLASSES_PER_PAGE);
  const selectedClass =
    visibleClasses.find((classroom) => classroom.id === selectedClassId) ??
    visibleClasses[0] ??
    filteredClasses[0] ??
    classes[0];
  const subjectOptions = useMemo(() => Array.from(new Set(classes.map((classroom) => classroom.subject))), [classes]);
  const ageOptions = useMemo(() => Array.from(new Set(classes.map((classroom) => classroom.ageGroup))), [classes]);

  const searchResult = useMemo(() => {
    if (!searched) {
      return null;
    }

    const source = apiChildResults ?? childResults;

    return (
      source.find(
        (student) => student.parentPhone === parentPhone.trim() && student.dateOfBirth === childDob,
      ) ??
      source[0] ??
      null
    );
  }, [apiChildResults, childDob, childResults, parentPhone, searched]);

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClass) {
      return;
    }

    setRegistrationSending(true);
    try {
      await guestService.registerClass(selectedClass.id, registrationForm);
      setRegistrationForm(emptyRegistrationForm);
      setRegistrationSent(true);
    } catch {
      setRegistrationSent(true);
    } finally {
      setRegistrationSending(false);
    }
  }

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    try {
      const results = await guestService.searchChild({ childDob, parentPhone });
      setApiChildResults(results);
      if (results[0]?.studentId) {
        setAttendanceHistory(await guestService.getAttendanceHistory(results[0].studentId));
      } else {
        setAttendanceHistory([]);
      }
      setSearched(true);
    } catch {
      setApiChildResults(null);
      setAttendanceHistory([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  function resetClassPage() {
    setClassPage(0);
  }

  function goToPreviousClasses() {
    setClassPage((page) => (page === 0 ? totalClassPages - 1 : page - 1));
  }

  function goToNextClasses() {
    setClassPage((page) => (page + 1 >= totalClassPages ? 0 : page + 1));
  }

  function openRegistrationForm() {
    setRegistrationOpen(true);
    setRegistrationSent(false);
  }

  return (
    <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,#fff8ef_0,#fbefe5_36%,#f6e7dc_100%)] text-[#2d211b]">
      <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4 xl:px-8">
        <header className="flex shrink-0 flex-col gap-3 rounded-3xl border border-[#ead8ca] bg-white/80 px-4 py-3 shadow-[0_16px_48px_rgba(123,82,52,0.10)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-[#8b5632]">An Nhiên Kids</p>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
              Cổng phụ huynh
            </p>
          </div>

          <div className="flex w-full rounded-full border border-[#d9bda8] bg-[#fffaf5] p-1 text-base font-bold shadow-inner md:w-auto">
            <button
              className={`h-11 flex-1 rounded-full px-5 transition md:flex-none ${
                activeTab === "classes"
                  ? "bg-[#a36c45] text-white shadow-[0_10px_22px_rgba(163,108,69,0.22)]"
                  : "text-[#6f4b34] hover:bg-[#f8eadf]"
              }`}
              onClick={() => setActiveTab("classes")}
              type="button"
            >
              Lớp học
            </button>
            <button
              className={`h-11 flex-1 rounded-full px-5 transition md:flex-none ${
                activeTab === "search"
                  ? "bg-[#a36c45] text-white shadow-[0_10px_22px_rgba(163,108,69,0.22)]"
                  : "text-[#6f4b34] hover:bg-[#f8eadf]"
              }`}
              onClick={() => setActiveTab("search")}
              type="button"
            >
              Tra cứu con
            </button>
          </div>

          <a
            className="hidden rounded-full border border-[#d9bda8] px-4 py-2 text-sm font-bold text-[#6f4b34] transition hover:bg-[#fff5ed] md:inline-flex"
            href="/admin"
          >
            Quản lý
          </a>
        </header>

        {activeTab === "classes" ? (
          <section className="grid min-h-0 flex-1 gap-4 overflow-y-auto xl:grid-cols-[minmax(0,1.58fr)_minmax(360px,0.62fr)] xl:overflow-hidden">
            <div className="flex min-h-0 flex-col rounded-3xl border border-[#ead8ca] bg-white/90 shadow-[0_20px_60px_rgba(123,82,52,0.10)]">
              <div className="shrink-0 border-b border-[#f0ded1] px-4 py-4 md:px-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
                  Lớp đang mở
                </p>
                <div className="mt-2 grid gap-4 2xl:grid-cols-[minmax(340px,0.75fr)_minmax(560px,1fr)] 2xl:items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                      Chọn lớp phù hợp cho con
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-[#8b5632]">
                      <span className="rounded-full bg-[#fff5ed] px-3 py-2">
                        {filteredClasses.length > 0
                          ? `${pageStart + 1}-${Math.min(pageStart + CLASSES_PER_PAGE, filteredClasses.length)} / ${
                              filteredClasses.length
                            } lớp`
                          : "0 lớp"}
                      </span>
                      <button
                        aria-label="Lớp trước"
                        className="grid size-10 place-items-center rounded-full border border-[#d9bda8] bg-white text-xl transition hover:-translate-y-0.5 hover:bg-[#f8eadf] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={filteredClasses.length <= CLASSES_PER_PAGE}
                        onClick={goToPreviousClasses}
                        type="button"
                      >
                        {"<"}
                      </button>
                      <button
                        aria-label="Lớp tiếp theo"
                        className="grid size-10 place-items-center rounded-full border border-[#d9bda8] bg-white text-xl transition hover:-translate-y-0.5 hover:bg-[#f8eadf] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={filteredClasses.length <= CLASSES_PER_PAGE}
                        onClick={goToNextClasses}
                        type="button"
                      >
                        {">"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <label className="grid gap-1.5 text-sm font-bold text-[#6f4b34]">
                      Môn học
                      <select
                        className="h-11 rounded-full border border-[#e4cdbc] bg-[#fffaf5] px-4 text-base font-semibold outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                        onChange={(event) => {
                          setSubjectFilter(event.target.value as SubjectFilter);
                          resetClassPage();
                        }}
                        value={subjectFilter}
                      >
                        <option value="all">Tất cả</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-[#6f4b34]">
                      Độ tuổi
                      <select
                        className="h-11 rounded-full border border-[#e4cdbc] bg-[#fffaf5] px-4 text-base font-semibold outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                        onChange={(event) => {
                          setAgeFilter(event.target.value as AgeFilter);
                          resetClassPage();
                        }}
                        value={ageFilter}
                      >
                        <option value="all">Tất cả</option>
                        {ageOptions.map((age) => (
                          <option key={age} value={age}>
                            {age}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-[#6f4b34]">
                      Học phí
                      <select
                        className="h-11 rounded-full border border-[#e4cdbc] bg-[#fffaf5] px-4 text-base font-semibold outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                        onChange={(event) => {
                          setPriceFilter(event.target.value as PriceFilter);
                          resetClassPage();
                        }}
                        value={priceFilter}
                      >
                        <option value="all">Tất cả</option>
                        <option value="under2m">Dưới 2 triệu</option>
                        <option value="2mto25m">2 - 2.5 triệu</option>
                        <option value="over25m">Trên 2.5 triệu</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:grid-cols-2 lg:grid-cols-3 xl:overflow-hidden">
                {visibleClasses.map((classroom) => {
                  const isSelected = classroom.id === selectedClass?.id;

                  return (
                    <button
                      className={`flex min-h-[260px] flex-col overflow-hidden rounded-3xl border p-4 text-left transition duration-200 md:min-h-0 2xl:p-5 ${
                        isSelected
                          ? "border-[#a36c45] bg-[#fff5ed] shadow-[0_18px_38px_rgba(163,108,69,0.18)]"
                          : "border-[#ead8ca] bg-white hover:-translate-y-1 hover:border-[#d9bda8] hover:bg-[#fffaf5] hover:shadow-[0_16px_34px_rgba(123,82,52,0.10)]"
                      }`}
                      key={classroom.id}
                      onClick={() => setSelectedClassId(classroom.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full bg-[#f2dfcf] px-3 py-1.5 text-sm font-extrabold text-[#8b5632]">
                          {classroom.highlight}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#a36c45]">
                          còn {classroom.seatsLeft} chỗ
                        </span>
                      </div>
                      <p className="mt-3 min-h-[46px] text-[1.35rem] font-extrabold leading-tight tracking-tight 2xl:text-2xl">
                        {classroom.name}
                      </p>
                      <div className="mt-2 grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(234,216,202,0.85)]">
                            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#a36c45]">
                              Môn học
                            </p>
                            <p className="mt-1 text-base font-extrabold text-[#2d211b]">{classroom.subject}</p>
                          </div>
                          <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(234,216,202,0.85)]">
                            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#a36c45]">
                              Độ tuổi
                            </p>
                            <p className="mt-1 text-base font-extrabold text-[#2d211b]">{classroom.ageRange}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-[#f7e6d8] px-3 py-2">
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8b5632]">
                            Học phí
                          </p>
                          <p className="mt-1 text-xl font-extrabold text-[#8b5632]">{classroom.tuition}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredClasses.length === 0 ? (
                  <div className="col-span-full grid place-items-center rounded-3xl border border-dashed border-[#d9bda8] bg-[#fffaf5] p-8 text-center text-base font-bold text-[#8b5632]">
                    Chưa có lớp phù hợp với bộ lọc này.
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="relative flex min-h-0 flex-col gap-5 rounded-3xl border border-[#ead8ca] bg-white/75 p-4 shadow-[0_20px_60px_rgba(123,82,52,0.10)] backdrop-blur md:p-5">
              <div className="rounded-3xl bg-gradient-to-br from-[#f3ddcb] to-[#fff1e5] p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#8b5632]">
                    Chi tiết lớp
                  </p>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-extrabold text-[#8b5632]">
                    {selectedClass?.highlight}
                  </span>
                </div>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight">{selectedClass?.name}</h2>
                <p className="mt-3 text-base leading-7 text-[#725e51]">{selectedClass?.description}</p>
              </div>

              <div className="rounded-3xl border border-[#ead8ca] bg-white p-5 text-base leading-8 text-[#3f3028] md:p-6">
                <p>
                  <span className="font-extrabold">Môn học:</span> {selectedClass?.subject}
                </p>
                <p>
                  <span className="font-extrabold">Độ tuổi:</span> {selectedClass?.ageRange}
                </p>
                <p>
                  <span className="font-extrabold">Giáo viên:</span> {selectedClass?.teacher}
                </p>
                <p>
                  <span className="font-extrabold">Lịch học:</span> {selectedClass?.schedule}
                </p>
                <p>
                  <span className="font-extrabold">Học phí:</span> {selectedClass?.tuition}
                </p>
                <p>
                  <span className="font-extrabold">Chỗ còn lại:</span> {selectedClass?.seatsLeft} chỗ
                </p>
              </div>

              <button
                className="mt-auto h-14 rounded-full bg-[#a36c45] px-6 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(163,108,69,0.24)] transition hover:-translate-y-1 hover:bg-[#8b5632]"
                onClick={openRegistrationForm}
                type="button"
              >
                Đăng ký ngay
              </button>
            </aside>
          </section>
        ) : (
          <section className="grid min-h-0 flex-1 gap-4 overflow-y-auto xl:grid-cols-[0.9fr_1.1fr] xl:overflow-hidden">
            <div className="rounded-3xl border border-[#ead8ca] bg-white/90 p-5 shadow-[0_20px_60px_rgba(123,82,52,0.10)] md:p-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
                Tra cứu học viên
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Tra cứu thông tin lớp của con
              </h1>
              <p className="mt-4 text-base leading-7 text-[#725e51]">
                Nhập số điện thoại phụ huynh và ngày sinh của con để xem lớp đang học.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={handleSearchSubmit}>
                <label className="grid gap-2 text-base font-extrabold">
                  Số điện thoại phụ huynh
                  <input
                    className="h-12 rounded-full border border-[#d9bda8] px-5 text-base font-medium outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                    onChange={(event) => {
                      setParentPhone(event.target.value);
                      setSearched(false);
                    }}
                    placeholder="0901234567"
                    required
                    value={parentPhone}
                  />
                </label>
                <label className="grid gap-2 text-base font-extrabold">
                  Ngày sinh của con
                  <input
                    className="h-12 rounded-full border border-[#d9bda8] px-5 text-base font-medium outline-none transition focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                    onChange={(event) => {
                      setChildDob(event.target.value);
                      setSearched(false);
                    }}
                    required
                    type="date"
                    value={childDob}
                  />
                </label>
                <button
                  className="mt-2 h-12 rounded-full bg-[#2d211b] text-base font-extrabold text-white transition hover:-translate-y-1"
                  disabled={searching}
                  type="submit"
                >
                  {searching ? "Đang tra cứu..." : "Tra cứu"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-[#ead8ca] bg-white/75 p-5 shadow-[0_20px_60px_rgba(123,82,52,0.10)] backdrop-blur md:p-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
                Kết quả
              </p>
              {searched ? (
                searchResult ? (
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-3xl bg-white p-6">
                      <p className="text-3xl font-extrabold">{searchResult.childName}</p>
                      <p className="mt-2 text-base text-[#725e51]">Ngày sinh: {searchResult.dateOfBirth}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-3xl bg-white p-5">
                        <p className="text-base text-[#725e51]">Lớp hiện tại</p>
                        <p className="mt-2 text-lg font-extrabold">{searchResult.currentClass}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-5">
                        <p className="text-base text-[#725e51]">Chuyên cần</p>
                        <p className="mt-2 text-lg font-extrabold">{searchResult.attendanceRate}</p>
                      </div>
                    </div>
                    <p className="rounded-3xl bg-[#f2dfcf] p-5 text-base font-bold leading-7 text-[#8b5632]">
                      {searchResult.latestNote}
                    </p>
                    <div className="rounded-3xl bg-white p-5">
                      <p className="text-lg font-extrabold">Lịch sử điểm danh</p>
                      <div className="mt-3 grid gap-2">
                        {attendanceHistory.length > 0 ? (
                          attendanceHistory.slice(0, 6).map((item) => (
                            <div className="rounded-2xl border border-[#ead8ca] px-4 py-3" key={item.id}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-extrabold">{item.lessonTitle || item.classroomName}</p>
                                <span className="rounded-full bg-[#fff5ed] px-3 py-1 text-xs font-extrabold text-[#8b5632]">
                                  {attendanceStatusLabel(item.status)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-[#725e51]">
                                {formatDateTime(item.startTime)} - {formatTime(item.endTime)}
                              </p>
                              {item.note ? <p className="mt-1 text-sm font-bold text-[#8b5632]">{item.note}</p> : null}
                            </div>
                          ))
                        ) : (
                          <p className="rounded-2xl bg-[#fffaf5] p-4 text-sm font-bold text-[#8b5632]">
                            Chưa có dữ liệu điểm danh chi tiết.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 rounded-3xl bg-white p-6 text-base font-bold text-[#8b5632]">
                    Không tìm thấy học viên phù hợp. Vui lòng kiểm tra lại số điện thoại và ngày sinh.
                  </p>
                )
              ) : (
                <div className="mt-5 rounded-3xl bg-white p-6 text-base leading-7 text-[#725e51]">
                  Dữ liệu demo: <span className="font-extrabold text-[#2d211b]">0901234567</span> và{" "}
                  <span className="font-extrabold text-[#2d211b]">2016-08-12</span>.
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {registrationOpen ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[#2d211b]/35 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-3xl border border-[#ead8ca] bg-white p-5 shadow-[0_24px_70px_rgba(45,33,27,0.22)] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a36c45]">
                  Đăng ký lớp học
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">{selectedClass?.name}</h2>
              </div>
              <button
                className="rounded-full border border-[#d9bda8] px-4 py-2 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#f8eadf]"
                onClick={() => setRegistrationOpen(false)}
                type="button"
              >
                Đóng
              </button>
            </div>

            <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={handleRegisterSubmit}>
              <input
                className="h-12 rounded-full border border-[#d9bda8] px-5 text-base outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                onChange={(event) =>
                  setRegistrationForm((form) => ({ ...form, childName: event.target.value }))
                }
                placeholder="Họ tên của con"
                required
                value={registrationForm.childName}
              />
              <input
                className="h-12 rounded-full border border-[#d9bda8] px-5 text-base outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                onChange={(event) =>
                  setRegistrationForm((form) => ({ ...form, childDob: event.target.value }))
                }
                required
                type="date"
                value={registrationForm.childDob}
              />
              <input
                className="h-12 rounded-full border border-[#d9bda8] px-5 text-base outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                onChange={(event) =>
                  setRegistrationForm((form) => ({ ...form, parentName: event.target.value }))
                }
                placeholder="Họ tên phụ huynh"
                required
                value={registrationForm.parentName}
              />
              <input
                className="h-12 rounded-full border border-[#d9bda8] px-5 text-base outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                onChange={(event) =>
                  setRegistrationForm((form) => ({ ...form, parentPhone: event.target.value }))
                }
                placeholder="Số điện thoại phụ huynh"
                required
                value={registrationForm.parentPhone}
              />
              <textarea
                className="min-h-24 rounded-3xl border border-[#d9bda8] px-5 py-3 text-base outline-none focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf] sm:col-span-2"
                onChange={(event) =>
                  setRegistrationForm((form) => ({ ...form, note: event.target.value }))
                }
                placeholder="Ghi chú thêm"
                value={registrationForm.note}
              />
              <button
                className="h-12 rounded-full bg-[#a36c45] text-base font-extrabold text-white transition hover:bg-[#8b5632] sm:col-span-2"
                disabled={registrationSending}
                type="submit"
              >
                {registrationSending ? "Đang gửi..." : "Gửi đăng ký"}
              </button>
            </form>

            {registrationSent ? (
              <p className="mt-4 rounded-3xl bg-[#fff5ed] p-4 text-base font-bold text-[#8b5632]">
                Đã nhận thông tin đăng ký. Trung tâm sẽ liên hệ phụ huynh để xác nhận.
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function attendanceStatusLabel(status: AttendanceHistoryItem["status"]) {
  const labels: Record<AttendanceHistoryItem["status"], string> = {
    ABSENT: "Vắng",
    EXCUSED: "Có phép",
    LATE: "Đi muộn",
    PRESENT: "Có mặt",
  };

  return labels[status];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
