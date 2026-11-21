import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PillLink } from "@/components/PillLink";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { getTaskDoc, getTaskDocs } from "@/lib/content";
import { buildMetadata, howToJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getTaskDocs().map((t) => ({ task: t.slug }));
}

function displayTaskName(task: string): string {
  return /\bexcel\b/i.test(task) ? task : `${task} in Excel`;
}

export async function generateMetadata({ params }: PageProps<"/how-to/[task]">) {
  const { task: slug } = await params;
  const task = getTaskDoc(slug);
  if (!task) return {};
  return buildMetadata({
    title: `How to ${displayTaskName(task.task)}`,
    description: task.intro.slice(0, 155),
    path: `/how-to/${slug}`,
    absoluteTitle: true,
  });
}

export default async function TaskPage({ params }: PageProps<"/how-to/[task]">) {
  const { task: slug } = await params;
  const task = getTaskDoc(slug);
  if (!task) notFound();
  const displayName = displayTaskName(task.task);
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <JsonLd
        data={howToJsonLd({
          name: `How to ${displayName}`,
          description: task.intro,
          steps: task.steps.map((s) => ({ name: s.heading, text: s.body })),
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "How-to guides", path: "/how-to" },
          { name: task.task, path: `/how-to/${slug}` },
        ]}
      />
      <header>
        <h1 className="text-3xl font-bold">How to {displayName}</h1>
        <p className="mt-3 text-lg leading-7 text-zinc-600 dark:text-zinc-400">{task.intro}</p>
      </header>
      {task.steps.map((step, i) => (
        <section key={step.heading}>
          <h2 className="text-xl font-semibold">
            {i + 1}. {step.heading}
          </h2>
          <p className="mt-2 leading-7 text-zinc-700 dark:text-zinc-300">{step.body}</p>
        </section>
      ))}
      {task.formulas.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Formulas</h2>
          <ul className="mt-3 space-y-3">
            {task.formulas.map((f) => (
              <li key={f.formula} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <code className="block overflow-x-auto rounded-lg bg-zinc-100 px-3 py-2 font-mono text-sm dark:bg-zinc-900">
                  {f.formula}
                </code>
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
                <PillLink href={`/functions/${rel}`}>{rel.toUpperCase()}</PillLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContextualLinks
        title="Need more Excel practice?"
        description="Use this guide as the reference, then reinforce the formulas in interactive exercises or assessment prep."
        links={[
          {
            href: "/practice",
            label: "Take the practice test",
            description: "Free interactive exercises",
          },
          {
            href: "/learn",
            label: "Learn Excel online free",
            description: "Structured lessons and tracks",
          },
          {
            href: "/certification",
            label: "Certification prep",
            description: "Exam-focused practice",
          },
        ]}
      />
    </article>
  );
}
