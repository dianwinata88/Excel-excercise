import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
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
    <article className="flex flex-col gap-8">
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
          {c.leftName} vs {c.rightName}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{c.intro}</p>
      </header>

      <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
        <h2 className="text-xl font-semibold">Verdict</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">{c.verdict}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Side by side</h2>
        <table className="mt-4 w-full text-left text-sm">
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
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Use {c.leftName} when…</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            {c.useLeftWhen.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
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
                  <Link
                    href={`/functions/${rel}`}
                    className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:border-emerald-400 dark:border-zinc-700"
                  >
                    {fn ? fn.name : rel.toUpperCase()}
                  </Link>
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
                <Link
                  href={`/compare/${rel}`}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:border-emerald-400 dark:border-zinc-700"
                >
                  {rel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
