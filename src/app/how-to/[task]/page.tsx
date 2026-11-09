import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getTaskDoc, getTaskDocs } from "@/lib/content";
import { buildMetadata, howToJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getTaskDocs().map((t) => ({ task: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/how-to/[task]">) {
  const { task: slug } = await params;
  const task = getTaskDoc(slug);
  if (!task) return {};
  return buildMetadata({
    title: `How to ${task.task} in Excel`,
    description: task.intro.slice(0, 155),
    path: `/how-to/${slug}`,
  });
}

export default async function TaskPage({ params }: PageProps<"/how-to/[task]">) {
  const { task: slug } = await params;
  const task = getTaskDoc(slug);
  if (!task) notFound();
  return (
    <article className="flex flex-col gap-8">
      <JsonLd
        data={howToJsonLd({
          name: `How to ${task.task} in Excel`,
          description: task.intro,
          steps: task.steps.map((s) => ({ name: s.heading, text: s.body })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: task.task, path: `/how-to/${slug}` }]} />
      <header>
        <h1 className="text-3xl font-bold">How to {task.task} in Excel</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{task.intro}</p>
      </header>
      {task.steps.map((step, i) => (
        <section key={step.heading}>
          <h2 className="text-xl font-semibold">
            {i + 1}. {step.heading}
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">{step.body}</p>
        </section>
      ))}
      {task.formulas.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Formulas</h2>
          <ul className="mt-3 space-y-3">
            {task.formulas.map((f) => (
              <li key={f.formula} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <code className="font-mono text-sm">{f.formula}</code>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {task.relatedFunctions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related functions</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {task.relatedFunctions.map((rel) => (
              <li key={rel}>
                <Link
                  href={`/functions/${rel}`}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:border-emerald-400 dark:border-zinc-700"
                >
                  {rel.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
