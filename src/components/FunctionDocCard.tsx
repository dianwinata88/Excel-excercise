import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import type { FunctionDoc } from "../../content/schema";

export function FunctionDocCard({
  fn,
  showCategory = false,
}: {
  fn: FunctionDoc;
  showCategory?: boolean;
}) {
  return (
    <Card href={`/functions/${fn.slug}`} size="sm" className="h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-base font-bold">{fn.name}</h3>
        {showCategory && <Badge tone="zinc">{fn.category}</Badge>}
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{fn.summary}</p>
      <p className="mt-3 break-words font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {fn.syntax}
      </p>
    </Card>
  );
}
