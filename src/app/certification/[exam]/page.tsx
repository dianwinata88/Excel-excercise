import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExamCard } from "@/components/certification/ExamCard";
import { FaqSection } from "@/components/certification/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import {
  getCertificationDoc,
  getCertificationDocs,
  getFunctionDoc,
  getLesson,
  getTaskDoc,
} from "@/lib/content";
import { buildMetadata, faqJsonLd, learningResourceJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getCertificationDocs().map((c) => ({ exam: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/certification/[exam]">) {
  const { exam: slug } = await params;
  const doc = getCertificationDoc(slug);
  if (!doc) return {};
  return buildMetadata({ title: doc.title, description: doc.description, path: `/certification/${slug}` });
}

const LEVELS: Record<string, string> = {
  "mo-210": "intermediate",
  "mo-211": "advanced",
  "job-assessment": "beginner",
};

export default async function CertificationExamPage({ params }: PageProps<"/certification/[exam]">) {
  const { exam: slug } = await params;
  const doc = getCertificationDoc(slug);
  if (!doc) notFound();

  const related = doc.related
    .map((rel) => getCertificationDoc(rel))
    .filter((c) => c !== undefined);
  const teaches = [
    ...new Set(doc.objectives.flatMap((o) => o.functionSlugs.map((f) => getFunctionDoc(f)?.name).filter(Boolean) as string[])),
  ];

  return (
    <article className="flex flex-col gap-8">
      <JsonLd
        data={[
          learningResourceJsonLd({
            name: doc.name,
            description: doc.description,
            path: `/certification/${slug}`,
            level: LEVELS[slug] ?? "intermediate",
            teaches: teaches.length ? teaches : [doc.shortName],
          }),
          ...(doc.faqs.length ? [faqJsonLd(doc.faqs)] : []),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Certification", path: "/certification" },
          { name: doc.shortName, path: `/certification/${slug}` },
        ]}
      />

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">{doc.code}</Badge>
          <Badge tone="zinc">{doc.provider.split("(")[0].trim()}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold">
          {doc.code} {doc.shortName} practice
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{doc.intro}</p>
        {doc.aliases.length > 0 && (
          <p className="mt-3 text-sm text-zinc-500">
            Also searched as: {doc.aliases.join(", ")}.
          </p>
        )}
      </header>

      {doc.facts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Exam at a glance</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doc.facts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <dt className="text-sm font-medium text-zinc-500">{fact.label}</dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">What the {doc.code} covers</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Each skill area below links to the lessons, how-to guides and functions that prepare you
          for it. Practice them in order, then test yourself in the{" "}
          <Link href="/practice" className="text-emerald-700 hover:underline dark:text-emerald-400">
            free practice sandbox
          </Link>
          .
        </p>
        <div className="mt-4 space-y-4">
          {doc.objectives.map((objective, i) => {
            const lessons = objective.lessonSlugs
              .map((s) => getLesson(s))
              .filter((l) => l !== undefined);
            const tasks = objective.taskSlugs
              .map((s) => getTaskDoc(s))
              .filter((t) => t !== undefined);
            const functions = objective.functionSlugs
              .map((s) => getFunctionDoc(s))
              .filter((f) => f !== undefined);
            const hasLinks = lessons.length + tasks.length + functions.length > 0;
            return (
              <div key={objective.name} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {i + 1}. {objective.name}
                  </h3>
                  {objective.weight && <Badge tone="amber">{objective.weight}</Badge>}
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{objective.description}</p>
                {hasLinks ? (
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    {lessons.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-zinc-500">Lessons</h4>
                        <ul className="mt-1 space-y-1">
                          {lessons.map((l) => (
                            <li key={l.slug}>
                              <Link href={`/lesson/${l.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                                {l.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-zinc-500">How-to guides</h4>
                        <ul className="mt-1 space-y-1">
                          {tasks.map((t) => (
                            <li key={t.slug}>
                              <Link href={`/how-to/${t.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                                {t.task}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {functions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-zinc-500">Functions</h4>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {functions.map((f) => (
                            <li key={f.slug}>
                              <Link
                                href={`/functions/${f.slug}`}
                                className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs hover:border-emerald-400 dark:border-zinc-700"
                              >
                                {f.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm">
                    <Link href="/practice" className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Practice this skill in the sandbox →
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
        <h2 className="text-xl font-semibold">Start practicing free</h2>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Work through the lessons above, then drill the same skills against timed exercises in the
          practice sandbox. Everything runs in your browser and needs no signup.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Open the practice sandbox
          </Link>
          <Link
            href="/learn"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:border-emerald-400 dark:border-zinc-700"
          >
            Browse all lessons
          </Link>
        </div>
      </section>

      <FaqSection faqs={doc.faqs} />

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Related prep</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {related.map((rel) => (
              <ExamCard key={rel.slug} doc={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
