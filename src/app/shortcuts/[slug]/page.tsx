import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getShortcutDoc, getShortcutDocs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getShortcutDocs().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shortcuts/[slug]">) {
  const { slug } = await params;
  const s = getShortcutDoc(slug);
  if (!s) return {};
  return buildMetadata({
    title: `Excel shortcut: ${s.action}`,
    description: s.description,
    path: `/shortcuts/${slug}`,
    absoluteTitle: true,
  });
}

export default async function ShortcutPage({ params }: PageProps<"/shortcuts/[slug]">) {
  const { slug } = await params;
  const s = getShortcutDoc(slug);
  if (!s) notFound();
  return (
    <article className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Shortcuts", path: "/shortcuts" },
          { name: s.action, path: `/shortcuts/${slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold">Excel shortcut: {s.action}</h1>
      <div className="flex gap-6">
        <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">Windows</p>
          <p className="mt-1 font-mono text-xl font-bold">{s.keys.windows}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">Mac</p>
          <p className="mt-1 font-mono text-xl font-bold">{s.keys.mac}</p>
        </div>
      </div>
      <p className="text-zinc-700 dark:text-zinc-300">{s.description}</p>
      {s.tips.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {s.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {s.relatedShortcuts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related shortcuts</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {s.relatedShortcuts.map((rel) => (
              <li key={rel}>
                <Link
                  href={`/shortcuts/${rel}`}
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
