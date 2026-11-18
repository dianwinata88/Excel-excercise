import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PillLink } from "@/components/PillLink";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { getComparisonDoc, getComparisonDocs, getFunctionDoc } from "@/lib/content";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getComparisonDocs().map((c) => ({ pair: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/compare/[pair]">) {
  const { pair: slug } = await params;
  const c = getComparisonDoc(slug);
  if (!c) return {};
  return buildMetadata({
    title: `${c.leftName} vs ${c.rightName} in Excel`,
    description: `${c.verdict.slice(0, 155)}`,
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params }: PageProps<"/compare/[pair]">) {
  const { pair: slug } = await params;
  const c = getComparisonDoc(slug);
  if (!c) notFound();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <JsonLd
        data={faqJsonLd([
          {
            question: `Should I use ${c.leftName} or ${c.rightName}?`,
            answer: c.verdict,
          },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Functions", path: "/functions" },
          { name: `${c.leftName} vs ${c.rightName}`, path: `/compare/${slug}` },
        ]}
      />
      <header>
        <h1 className="text-3xl font-bold">
          {c.leftName} vs {c.rightName} in Excel
        </h1>
        <p className="mt-3 text-lg leading-7 text-zinc-600 dark:text-zinc-400">{c.intro}</p>
      </header>

      <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
        <h2 className="text-lg font-semibold">Verdict</h2>
        <p className="mt-2 leading-7 text-zinc-700 dark:text-zinc-300">{c.verdict}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Side by side</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 pr-4"></th>
              <th className="py-2 pr-4 font-mono font-semibold">{c.leftName}</th>
              <th className="py-2 font-mono font-semibold">{c.rightName}</th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row) => (
              <tr key={row.aspect} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-4 font-medium">{row.aspect}</td>
                <td className="py-2 pr-4">{row.left}</td>
                <td className="py-2">{row.right}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Use {c.leftName} when…</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            {c.useLeftWhen.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Use {c.rightName} when…</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            {c.useRightWhen.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </section>

      {c.relatedFunctions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related functions</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {c.relatedFunctions.map((rel) => {
              const fn = getFunctionDoc(rel);
              return (
                <li key={rel}>
                  <PillLink href={`/functions/${rel}`}>
                    {fn ? fn.name : rel.toUpperCase()}
                  </PillLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {c.relatedComparisons.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">More comparisons</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {c.relatedComparisons.map((rel) => (
              <li key={rel}>
                <PillLink href={`/compare/${rel}`}>{rel}</PillLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContextualLinks
        title="Ready to practice the formulas?"
        description="Read the verdict here, then prove the functions in interactive exercises or compare the next pair."
        links={[
          {
            href: "/practice",
            label: "Practice formulas online",
            description: "Free interactive exercises",
          },
          {
            href: "/functions",
            label: "Browse function guides",
            description: "Syntax, examples and errors",
          },
          {
            href: "/compare",
            label: "More comparisons",
            description: "VLOOKUP, SUMIF, INDEX MATCH and more",
          },
        ]}
      />
    </article>
  );
}
