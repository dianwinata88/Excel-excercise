import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExerciseEmbed } from "@/components/ExerciseEmbed";
import { JsonLd } from "@/components/JsonLd";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { getFunctionDoc, getFunctionDocs } from "@/lib/content";
import { buildMetadata, faqJsonLd, howToJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getFunctionDocs().map((f) => ({ fn: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/functions/[fn]">) {
  const { fn: slug } = await params;
  const fn = getFunctionDoc(slug);
  if (!fn) return {};
  return buildMetadata({
    title: `Excel ${fn.name} Function — Syntax & Examples`,
    description: `${fn.summary} Syntax, examples, common errors and a hands-on exercise.`,
    path: `/functions/${slug}`,
  });
}

export default async function FunctionPage({ params }: PageProps<"/functions/[fn]">) {
  const { fn: slug } = await params;
  const fn = getFunctionDoc(slug);
  if (!fn) notFound();

  return (
    <article className="flex flex-col gap-8">
      <JsonLd
        data={[
          howToJsonLd({
            name: `How to use the ${fn.name} function in Excel`,
            description: fn.summary,
            steps: fn.examples.map((e) => ({ name: e.title, text: `${e.formula} → ${e.result}` })),
          }),
          ...(fn.commonErrors.length
            ? [
                faqJsonLd(
                  fn.commonErrors.map((e) => ({
                    question: `Why does ${fn.name} return ${e.error}?`,
                    answer: `${e.cause} ${e.fix}`,
                  })),
                ),
              ]
            : []),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Functions", path: "/functions" },
          { name: fn.name, path: `/functions/${slug}` },
        ]}
      />
      <header>
        <h1 className="text-3xl font-bold">How to use {fn.name} in Excel</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{fn.intro}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Syntax</h2>
        <code className="mt-2 block rounded-lg bg-zinc-100 p-4 font-mono text-sm dark:bg-zinc-900">
          {fn.syntax}
        </code>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 pr-4">Argument</th>
              <th className="py-2 pr-4">Required</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {fn.params.map((p) => (
              <tr key={p.name} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-4 font-mono">{p.name}</td>
                <td className="py-2 pr-4">{p.required ? "Yes" : "Optional"}</td>
                <td className="py-2">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Examples</h2>
        <ul className="mt-3 space-y-4">
          {fn.examples.map((ex) => (
            <li key={ex.title} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold">{ex.title}</h3>
              <p className="mt-2">
                <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm dark:bg-zinc-900">
                  {ex.formula}
                </code>{" "}
                → <strong>{String(ex.result)}</strong>
              </p>
              {ex.note && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{ex.note}</p>}
            </li>
          ))}
        </ul>
      </section>

      {fn.exerciseId && (
        <section>
          <h2 className="text-xl font-semibold">Try it yourself</h2>
          <div className="mt-3">
            <ExerciseEmbed exerciseId={fn.exerciseId} />
          </div>
        </section>
      )}

      {fn.commonErrors.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Common errors</h2>
          <ul className="mt-3 space-y-3">
            {fn.commonErrors.map((e) => (
              <li key={e.error} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="font-mono font-semibold text-red-600">{e.error}</p>
                <p className="mt-1 text-sm">{e.cause}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Fix: {e.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fn.relatedFunctions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related functions</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {fn.relatedFunctions.map((rel) => (
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

      <ContextualLinks
        title="Preparing for an Excel test or certification?"
        description="Review the syntax here, then practice the formula in a realistic exercise or assessment-focused path."
        links={[
          {
            href: "/practice",
            label: "Practice Excel formulas",
            description: "Free interactive exercises",
          },
          {
            href: "/how-to/excel-formulas-job-interview",
            label: "Excel formulas for interviews",
            description: "Job-test formula prep",
          },
          {
            href: "/certification",
            label: "Certification prep",
            description: "MO-200, MO-201 and job tests",
          },
        ]}
      />
    </article>
  );
}
