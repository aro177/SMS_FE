const summaryCards = [
  { label: "Active students", value: "248", trend: "+12 this month" },
  { label: "Open classes", value: "18", trend: "4 need schedules" },
  { label: "Teachers", value: "26", trend: "2 onboarding" },
  { label: "Attendance today", value: "94%", trend: "+3% vs yesterday" },
];

const classes = [
  {
    name: "Morning Grade 5",
    teacher: "Nguyen Thi Lan",
    students: 28,
    tuition: "$120",
    status: "Active",
  },
  {
    name: "Math Foundation",
    teacher: "Tran Minh Khoa",
    students: 18,
    tuition: "$95",
    status: "Scheduling",
  },
  {
    name: "English Starter",
    teacher: "Pham Gia Han",
    students: 22,
    tuition: "$105",
    status: "Active",
  },
];

const recentStudents = [
  { name: "Le Bao Anh", parent: "Le Thanh Tung", className: "Morning Grade 5" },
  { name: "Do Minh Chau", parent: "Do Quynh Mai", className: "English Starter" },
  { name: "Hoang Nam Phong", parent: "Hoang Viet Duc", className: "Math Foundation" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#15201d]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-[#d8e5df] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#2f7d64]">Student Management System</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">School operations</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="h-10 w-full rounded-md border border-[#cddbd5] bg-white px-3 text-sm outline-none transition focus:border-[#2f7d64] focus:ring-2 focus:ring-[#b8ddd0] sm:w-64"
              placeholder="Search student, class, parent"
            />
            <button className="h-10 rounded-md bg-[#246b55] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5947]">
              Add student
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              className="rounded-lg border border-[#d8e5df] bg-white p-4 shadow-sm"
              key={card.label}
            >
              <p className="text-sm font-medium text-[#5d6f68]">{card.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold">{card.value}</p>
                <p className="text-sm font-medium text-[#2f7d64]">{card.trend}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg border border-[#d8e5df] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#d8e5df] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Classes</h2>
                <p className="text-sm text-[#5d6f68]">Track rooms, teachers, tuition, and enrollment.</p>
              </div>
              <button className="h-9 rounded-md border border-[#cddbd5] px-3 text-sm font-semibold transition hover:bg-[#edf6f2]">
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-[#edf6f2] text-[#455850]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Teacher</th>
                    <th className="px-4 py-3 font-semibold">Students</th>
                    <th className="px-4 py-3 font-semibold">Tuition</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classroom) => (
                    <tr className="border-t border-[#e4eee9]" key={classroom.name}>
                      <td className="px-4 py-4 font-semibold">{classroom.name}</td>
                      <td className="px-4 py-4 text-[#455850]">{classroom.teacher}</td>
                      <td className="px-4 py-4 text-[#455850]">{classroom.students}</td>
                      <td className="px-4 py-4 text-[#455850]">{classroom.tuition}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[#e3f5ee] px-2 py-1 text-xs font-semibold text-[#246b55]">
                          {classroom.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-lg border border-[#d8e5df] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Recent students</h2>
              <div className="mt-4 flex flex-col divide-y divide-[#e4eee9]">
                {recentStudents.map((student) => (
                  <div className="py-3 first:pt-0 last:pb-0" key={student.name}>
                    <p className="font-semibold">{student.name}</p>
                    <p className="mt-1 text-sm text-[#5d6f68]">{student.className}</p>
                    <p className="mt-1 text-xs font-medium text-[#2f7d64]">Parent: {student.parent}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#d8e5df] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Setup checklist</h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <label className="flex items-center gap-3">
                  <input className="size-4 accent-[#246b55]" defaultChecked type="checkbox" />
                  Frontend scaffold
                </label>
                <label className="flex items-center gap-3">
                  <input className="size-4 accent-[#246b55]" defaultChecked type="checkbox" />
                  API config layer
                </label>
                <label className="flex items-center gap-3">
                  <input className="size-4 accent-[#246b55]" type="checkbox" />
                  Connect backend endpoints
                </label>
                <label className="flex items-center gap-3">
                  <input className="size-4 accent-[#246b55]" type="checkbox" />
                  Add auth flow
                </label>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
