import Link from "next/link";
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
      <h1 className="text-3xl font-bold">Excel shortcuts</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 pr-4">Action</th>
            <th className="py-2 pr-4">Windows</th>
            <th className="py-2">Mac</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((s) => (
            <tr key={s.slug} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-4">
                <Link href={`/shortcuts/${s.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                  {s.action}
                </Link>
              </td>
              <td className="py-2 pr-4 font-mono">{s.keys.windows}</td>
              <td className="py-2 font-mono">{s.keys.mac}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
