import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, levelTone } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LessonPlayer } from "@/components/exercise/LessonPlayer";
import { JsonLd } from "@/components/JsonLd";
import { ProGate } from "@/components/ProGate";
import { getSession } from "@/lib/auth";
import type { Exercise, Lesson } from "../../../../content/schema";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import {
  getExercise,
  getFunctionDoc,
  getLesson,
  getLessons,
  getTaskDoc,
  getTopic,
} from "@/lib/content";
import { buildMetadata, faqJsonLd, learningResourceJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getLessons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return buildMetadata({
    title: `${lesson.title} in Excel`,
    description: lesson.description,
    path: `/lesson/${slug}`,
  });
}

async function PracticeArea({
  slug,
  lesson,
  exercises,
}: {
  slug: string;
  lesson: Lesson;
  exercises: Exercise[];
}) {
  const session = await getSession();
  if (lesson.level !== "beginner" && !session?.pro) {
    return <ProGate next={`/lesson/${slug}`} />;
  }
  return <LessonPlayer exercises={exercises} />;
}

export default async function LessonPage({ params }: PageProps<"/lesson/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const topic = getTopic(lesson.topic);
  const exercises = lesson.exercises
    .map((id) => getExercise(id))
    .filter((e) => e !== undefined);
  const relatedFunctions = lesson.relatedFunctions
    .map((rel) => getFunctionDoc(rel))
    .filter((f) => f !== undefined);
  const relatedTasks = lesson.relatedTasks
    .map((rel) => getTaskDoc(rel))
    .filter((t) => t !== undefined);
  const relatedLessons = getLessons().filter(
    (l) => l.slug !== lesson.slug && lesson.relatedLessons.includes(l.slug),
  );
  const teaches = [
    topic?.name ?? lesson.topic,
    ...relatedFunctions.map((f) => f.name),
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-8">
      <JsonLd
        data={[
          learningResourceJsonLd({
            name: lesson.title,
            description: lesson.description,
            path: `/lesson/${slug}`,
            level: lesson.level,
            teaches,
          }),
          ...(lesson.faqs.length ? [faqJsonLd(lesson.faqs)] : []),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Lessons", path: "/learn" },
          ...(topic ? [{ name: topic.name, path: `/learn/${topic.slug}` }] : []),
          { name: lesson.title, path: `/lesson/${slug}` },
        ]}
      />
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={levelTone(lesson.level)}>{lesson.level}</Badge>
          <Badge tone="zinc">
            {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold">{lesson.title} in Excel</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
        {lesson.overview && (
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">{lesson.overview}</p>
        )}
      </header>

      {lesson.objectives.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">What you&apos;ll practice</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.steps.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">How the lesson works</h2>
          <ol className="mt-3 space-y-4">
            {lesson.steps.map((step, i) => (
              <li key={step.heading} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-semibold">
                  {i + 1}. {step.heading}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">Practice now</h2>
        <div className="mt-3">
          <Suspense
            fallback={
              <div className="h-40 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800" />
            }
          >
            <PracticeArea slug={slug} lesson={lesson} exercises={exercises} />
          </Suspense>
        </div>
      </section>

      {lesson.faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          <div className="mt-3 space-y-3">
            {lesson.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {(relatedFunctions.length > 0 || relatedTasks.length > 0 || relatedLessons.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-3">
          {relatedFunctions.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Functions</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {relatedFunctions.map((fn) => (
                  <li key={fn.slug}>
                    <Link
                      href={`/functions/${fn.slug}`}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:border-emerald-400 dark:border-zinc-700"
                    >
                      {fn.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relatedTasks.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">How-to guides</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {relatedTasks.map((task) => (
                  <li key={task.slug}>
                    <Link href={`/how-to/${task.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      {task.task}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relatedLessons.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Next lessons</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {relatedLessons.map((related) => (
                  <li key={related.slug}>
                    <Link href={`/lesson/${related.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <ContextualLinks
        title="Using this for Excel test or interview prep?"
        description="Turn the lesson into assessment-ready speed with timed practice, interview questions and certification-focused paths."
        links={[
          {
            href: "/practice",
            label: "Practice this skill",
            description: "Free interactive exercises",
          },
          {
            href: "/how-to/excel-interview-questions",
            label: "Excel interview questions",
            description: "Common test topics",
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
