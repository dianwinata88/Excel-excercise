import Link from "next/link";
import { getTopics } from "@/lib/content";
import { SITE_NAME } from "@/lib/seo";

export default function Home() {
  const topics = getTopics();
  return (
    <div className="flex flex-col gap-12">
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Learn Excel by doing — not watching
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          {SITE_NAME} gives you bite-sized, interactive exercises that run right in your
          browser. Type real formulas, press real shortcuts, earn XP.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/learn"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Start practicing
          </Link>
          <Link
            href="/functions"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Browse functions
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Pick a skill</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="block rounded-xl border border-zinc-200 p-5 hover:border-emerald-400 dark:border-zinc-800"
              >
                <h3 className="font-semibold">{topic.name}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {topic.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
