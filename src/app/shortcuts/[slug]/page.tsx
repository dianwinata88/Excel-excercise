import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PillLink } from "@/components/PillLink";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
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
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Shortcuts", path: "/shortcuts" },
          { name: s.action, path: `/shortcuts/${slug}` },
        ]}
      />
      <header>
        <h1 className="text-3xl font-bold">Excel shortcut: {s.action}</h1>
        <p className="mt-3 text-lg leading-7 text-zinc-600 dark:text-zinc-400">{s.description}</p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Windows</p>
          <p className="mt-2 break-words font-mono text-lg font-bold sm:text-xl">{s.keys.windows}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mac</p>
          <p className="mt-2 break-words font-mono text-lg font-bold sm:text-xl">{s.keys.mac}</p>
        </div>
      </div>
      {s.tips.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Tips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {s.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}
      {s.relatedShortcuts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related shortcuts</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {s.relatedShortcuts.map((rel) => (
              <li key={rel}>
                <PillLink href={`/shortcuts/${rel}`}>{rel}</PillLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      <ContextualLinks
        title="Put the shortcut into practice"
        description="Shortcuts stick faster when you use them in a real spreadsheet. Drill the action, then keep exploring the shortcut library."
        links={[
          {
            href: "/practice",
            label: "Practice shortcuts",
            description: "Interactive keyboard drills",
          },
          {
            href: "/shortcuts",
            label: "Browse all shortcuts",
            description: "Windows and Mac reference",
          },
          {
            href: "/learn",
            label: "Learn Excel free",
            description: "Structured bite-sized lessons",
          },
        ]}
      />
    </article>
  );
}
