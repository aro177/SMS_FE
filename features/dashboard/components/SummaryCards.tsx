import type { SummaryMetric } from "../types";

type SummaryCardsProps = {
  metrics: SummaryMetric[];
};

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article className="rounded-lg border border-[#ead8ca] bg-white p-4 shadow-sm" key={metric.label}>
          <p className="text-sm font-medium text-[#725e51]">{metric.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-[#2d211b]">{metric.value}</p>
            <p className="text-sm font-medium text-[#a36c45]">{metric.trend}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
