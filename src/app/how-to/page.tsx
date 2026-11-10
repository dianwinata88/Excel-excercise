import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getTaskDocs } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel How-To Guides — Formulas, Lookups & Data Cleaning",
  description: "Step-by-step Excel how-to guides for lookups, duplicate removal, text cleanup, conditional totals and more.",
  path: "/how-to",
});

export default function HowToIndexPage() {
  const tasks = [...getTaskDocs()].sort((a, b) => a.task.localeCompare(b.task));
  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel How-To Guides",
          description: "Step-by-step Excel guides for practical spreadsheet tasks.",
          path: "/how-to",
          items: tasks.map((task) => ({ name: task.task, path: `/how-to/${task.slug}` })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "How-to guides", path: "/how-to" }]} />
      <header>
        <h1 className="text-3xl font-bold">Excel how-to guides</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Practical, formula-first walkthroughs for the tasks people search for most: lookups,
          duplicates, text cleanup, conditional totals and spreadsheet shortcuts.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {tasks.map((task) => (
          <li key={task.slug}>
            <Link
              href={`/how-to/${task.slug}`}
              className="block h-full rounded-xl border border-zinc-200 p-5 hover:border-emerald-400 dark:border-zinc-800"
            >
              <h2 className="font-semibold">{task.task}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{task.intro}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Read the guide →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
