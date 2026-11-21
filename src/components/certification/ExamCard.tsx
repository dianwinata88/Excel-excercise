import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import type { CertificationDoc } from "../../../content/schema";

export function ExamCard({ doc }: { doc: CertificationDoc }) {
  const duration = doc.facts.find((f) => f.label.toLowerCase().includes("duration") || f.label.toLowerCase().includes("length"));
  return (
    <Card href={`/certification/${doc.slug}`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="green">{doc.code}</Badge>
        <Badge tone="zinc">{doc.provider.split("(")[0].trim()}</Badge>
      </div>
      <h3 className="text-xl font-semibold">{doc.shortName}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{doc.name}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {doc.objectives.length} skill area{doc.objectives.length === 1 ? "" : "s"} mapped to free
        interactive practice
        {duration ? ` · ${duration.value}` : ""}
      </p>
      <span className="mt-auto text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        View practice plan →
      </span>
    </Card>
  );
}
