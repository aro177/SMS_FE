import type { ClassroomOverview } from "../types";

type ClassesTableProps = {
  classes: ClassroomOverview[];
  onDelete?: (classroom: ClassroomOverview) => void;
  onEdit?: (classroom: ClassroomOverview) => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
};

const statusLabels: Record<ClassroomOverview["status"], string> = {
  Active: "Đang mở",
  Scheduling: "Đang xếp lịch",
  Paused: "Tạm dừng",
};

export function ClassesTable({ classes, onDelete, onEdit, onViewAll, viewAllLabel = "Xem tất cả" }: ClassesTableProps) {
  const hasActions = Boolean(onDelete || onEdit);

  return (
    <section className="rounded-lg border border-[#ead8ca] bg-white shadow-sm" id="classes">
      <div className="flex flex-col gap-3 border-b border-[#ead8ca] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2d211b]">Lớp học</h2>
          <p className="text-sm text-[#725e51]">Theo dõi giáo viên, học phí và số học viên của từng lớp.</p>
        </div>
        <button
          className="h-9 rounded-md border border-[#d9bda8] px-3 text-sm font-semibold text-[#6f4b34] transition hover:bg-[#f8eadf]"
          onClick={onViewAll}
          type="button"
        >
          {viewAllLabel}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-[#fff5ed] text-[#725e51]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên lớp</th>
              <th className="px-4 py-3 font-semibold">Giáo viên</th>
              <th className="px-4 py-3 font-semibold">Học viên</th>
              <th className="px-4 py-3 font-semibold">Học phí</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              {hasActions ? <th className="px-4 py-3 font-semibold">Thao tác</th> : null}
            </tr>
          </thead>
          <tbody>
            {classes.map((classroom) => (
              <tr className="border-t border-[#f0ded1]" key={classroom.id ?? classroom.name}>
                <td className="px-4 py-4 font-semibold text-[#2d211b]">{classroom.name}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.teacher}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.students}</td>
                <td className="px-4 py-4 text-[#725e51]">{classroom.tuition}</td>
                <td className="px-4 py-4">
                  <span className="rounded-md bg-[#f2dfcf] px-2 py-1 text-xs font-semibold text-[#8b5632]">
                    {statusLabels[classroom.status]}
                  </span>
                </td>
                {hasActions ? (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {onEdit ? (
                        <button
                          className="rounded-full border border-[#d9bda8] px-3 py-1 text-xs font-extrabold text-[#6f4b34] transition hover:bg-[#fff5ed]"
                          onClick={() => onEdit(classroom)}
                          type="button"
                        >
                          Sửa
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          className="rounded-full border border-[#efb5a8] px-3 py-1 text-xs font-extrabold text-[#9b3f2c] transition hover:bg-[#fff1ee]"
                          onClick={() => onDelete(classroom)}
                          type="button"
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
