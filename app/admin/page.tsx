import { AdminDashboardShell } from "@/features/admin/components/AdminDashboardShell";
import { classroomOverviews } from "@/features/classes/data/classes-data";
import { summaryMetrics } from "@/features/dashboard/data/dashboard-data";
import { setupTasks } from "@/features/setup/data/setup-data";
import { recentStudents } from "@/features/students/data/students-data";

export default function AdminPage() {
  return (
    <AdminDashboardShell
      classes={classroomOverviews}
      metrics={summaryMetrics}
      setupTasks={setupTasks}
      students={recentStudents}
    />
  );
}
