import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getShortcutDocs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Keyboard Shortcuts",
  description: "Every Excel shortcut for Windows and Mac, with practice exercises.",
  path: "/shortcuts",
});

export default function ShortcutsIndex() {
  const shortcuts = getShortcutDocs();
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Shortcuts", path: "/shortcuts" }]} />
      <header>
        <Badge tone="green">{shortcuts.length} shortcuts</Badge>
        <h1 className="mt-3 text-3xl font-bold">Excel shortcuts</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Windows and Mac keyboard shortcuts for faster spreadsheet work, each with a practice page.
        </p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Windows</th>
              <th className="px-4 py-3 font-semibold">Mac</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((s) => (
              <tr
                key={s.slug}
                className="border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/shortcuts/${s.slug}`}
                    className="inline-flex min-h-11 items-center font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {s.action}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <kbd className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {s.keys.windows}
                  </kbd>
                </td>
                <td className="px-4 py-2">
                  <kbd className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {s.keys.mac}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
