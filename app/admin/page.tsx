import { ClassesTable } from "@/features/classes/components/ClassesTable";
import { classroomOverviews } from "@/features/classes/data/classes-data";
import { DashboardHero } from "@/features/dashboard/components/DashboardHero";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { heroActions, summaryMetrics } from "@/features/dashboard/data/dashboard-data";
import { SetupChecklist } from "@/features/setup/components/SetupChecklist";
import { setupTasks } from "@/features/setup/data/setup-data";
import { RecentStudents } from "@/features/students/components/RecentStudents";
import { recentStudents } from "@/features/students/data/students-data";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#fbf6f1] text-[#2d211b]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <DashboardHero actions={heroActions} />
        <SummaryCards metrics={summaryMetrics} />

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ClassesTable classes={classroomOverviews} />
          <aside className="flex flex-col gap-6">
            <RecentStudents students={recentStudents} />
            <SetupChecklist tasks={setupTasks} />
          </aside>
        </section>
      </div>
    </main>
  );
}
