import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getFunctionDocs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Functions A–Z",
  description: "Every Excel function explained with syntax, examples and hands-on practice.",
  path: "/functions",
});

export default function FunctionsIndex() {
  const fns = getFunctionDocs().sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Functions", path: "/functions" }]} />
      <h1 className="text-3xl font-bold">Excel functions</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fns.map((fn) => (
          <li key={fn.slug}>
            <Link
              href={`/functions/${fn.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-emerald-400 dark:border-zinc-800"
            >
              <span className="font-mono font-semibold">{fn.name}</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fn.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
