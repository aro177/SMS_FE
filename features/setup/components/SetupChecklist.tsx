import type { SetupTask } from "../types";

type SetupChecklistProps = {
  tasks: SetupTask[];
};

export function SetupChecklist({ tasks }: SetupChecklistProps) {
  return (
    <section className="rounded-lg border border-[#ead8ca] bg-white p-4 shadow-sm" id="setup">
      <h2 className="text-lg font-semibold text-[#2d211b]">Việc cần hoàn thiện</h2>
      <div className="mt-4 flex flex-col gap-3 text-sm">
        {tasks.map((task) => (
          <label className="flex items-center gap-3 text-[#2d211b]" key={task.label}>
            <input className="size-4 accent-[#a36c45]" defaultChecked={task.done} type="checkbox" />
            {task.label}
          </label>
        ))}
      </div>
    </section>
  );
}
