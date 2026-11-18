import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SeoSearchGrid } from "@/components/SeoSearchGrid";
import { getTaskDocs } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Interview Questions & How-To Guides",
  description:
    "Answer common Excel interview questions and solve practical spreadsheet tasks with step-by-step formulas, examples, and practice links.",
  path: "/how-to",
});

export default function HowToIndexPage() {
  const tasks = [...getTaskDocs()].sort((a, b) => a.task.localeCompare(b.task));
  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel Interview Questions & How-To Guides",
          description: "Step-by-step Excel guides for interviews, assessments and practical spreadsheet tasks.",
          path: "/how-to",
          items: tasks.map((task) => ({ name: task.task, path: `/how-to/${task.slug}` })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "How-to guides", path: "/how-to" }]} />
      <header>
        <Badge tone="green">{tasks.length} guides</Badge>
        <h1 className="mt-3 text-3xl font-bold">Excel interview questions and how-to guides</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Practical, formula-first walkthroughs for the tasks people search for most: lookups,
          duplicates, text cleanup, conditional totals and spreadsheet shortcuts.
        </p>
      </header>
      <SeoSearchGrid
        items={tasks.map((task) => ({
          href: `/how-to/${task.slug}`,
          title: task.task,
          description: task.intro,
          badge: "Guide",
          badgeTone: "zinc",
        }))}
        searchLabel="Search how-to guides"
        placeholder="Search tasks, formulas or topics"
        emptyMessage="No guides match that search. Try a broader term like lookup, text or duplicates."
      />
    </div>
  );
}
