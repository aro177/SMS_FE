import type { RecentStudent } from "../types";

type RecentStudentsProps = {
  students: RecentStudent[];
};

export function RecentStudents({ students }: RecentStudentsProps) {
  return (
    <section className="rounded-lg border border-[#ead8ca] bg-white p-4 shadow-sm" id="students">
      <h2 className="text-lg font-semibold text-[#2d211b]">Học viên gần đây</h2>
      <div className="mt-4 flex flex-col divide-y divide-[#f0ded1]">
        {students.map((student) => (
          <div className="py-3 first:pt-0 last:pb-0" key={student.name}>
            <p className="font-semibold text-[#2d211b]">{student.name}</p>
            <p className="mt-1 text-sm text-[#725e51]">{student.className}</p>
            <p className="mt-1 text-xs font-medium text-[#a36c45]">Phụ huynh: {student.parent}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
