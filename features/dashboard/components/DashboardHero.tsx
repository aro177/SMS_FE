import type { HeroAction } from "../types";

type DashboardHeroProps = {
  actions: HeroAction[];
};

export function DashboardHero({ actions }: DashboardHeroProps) {
  return (
    <header className="overflow-hidden rounded-lg border border-[#ead8ca] bg-[#fffaf5] shadow-sm">
      <div className="grid gap-6 p-5 lg:grid-cols-[1.4fr_0.8fr] lg:p-7">
        <div className="flex flex-col justify-between gap-8">
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#7d5a43]">
            <span className="rounded-md bg-[#f2dfcf] px-3 py-1 text-[#8b5632]">SMS Yoga Center</span>
            <a className="hover:text-[#a36c45]" href="#classes">
              Classes
            </a>
            <a className="hover:text-[#a36c45]" href="#students">
              Students
            </a>
            <a className="hover:text-[#a36c45]" href="#setup">
              Setup
            </a>
          </nav>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a36c45]">
              Student Management System
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-[#2d211b] sm:text-5xl">
              Manage yoga classes, students, and attendance without the clutter.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#725e51]">
              A simple operations screen inspired by the Eduma Yoga layout, rebuilt for a practical
              school management workflow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <a
                className={
                  action.tone === "primary"
                    ? "inline-flex h-11 items-center justify-center rounded-md bg-[#a36c45] px-5 text-sm font-semibold text-white transition hover:bg-[#8b5632]"
                    : "inline-flex h-11 items-center justify-center rounded-md border border-[#d9bda8] px-5 text-sm font-semibold text-[#6f4b34] transition hover:bg-[#f8eadf]"
                }
                href={action.href}
                key={action.label}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#f2dfcf] p-4">
          <div className="flex min-h-72 flex-col justify-between rounded-lg border border-[#d9bda8] bg-white p-5">
            <div>
              <p className="text-sm font-semibold text-[#a36c45]">Today focus</p>
              <p className="mt-2 text-2xl font-semibold text-[#2d211b]">Keep classes balanced</p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-md bg-[#fff5ed] p-3">
                <p className="text-sm font-semibold text-[#2d211b]">18 classes running</p>
                <p className="mt-1 text-sm text-[#725e51]">4 classes still need lesson schedules.</p>
              </div>
              <div className="rounded-md bg-[#fff5ed] p-3">
                <p className="text-sm font-semibold text-[#2d211b]">94% attendance</p>
                <p className="mt-1 text-sm text-[#725e51]">Track students and follow up absences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
