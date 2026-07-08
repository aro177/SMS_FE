import type { ClassroomOverview } from "../types";

type ClassesTableProps = {
  classes: ClassroomOverview[];
};

export function ClassesTable({ classes }: ClassesTableProps) {
  return (
    <section className="rounded-lg border border-[#ead8ca] bg-white shadow-sm" id="classes">
      <div className="flex flex-col gap-3 border-b border-[#ead8ca] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2d211b]">Classes</h2>
          <p className="text-sm text-[#725e51]">Track rooms, teachers, tuition, and enrollment.</p>
        </div>
        <button className="h-9 rounded-md border border-[#d9bda8] px-3 text-sm font-semibold text-[#6f4b34] transition hover:bg-[#f8eadf]">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-[#fff5ed] text-[#725e51]">
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
              <tr className="border-t border-[#f0ded1]" key={classroom.name}>
                <td className="px-4 py-4 font-semibold text-[#2d211b]">{classroom.name}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.teacher}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.students}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.tuition}</td>
                <td className="px-4 py-4">
                  <span className="rounded-md bg-[#f2dfcf] px-2 py-1 text-xs font-semibold text-[#8b5632]">
                    {classroom.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
