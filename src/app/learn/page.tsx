import { Badge, levelTone } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { FaqSection } from "@/components/seo/FaqSection";
import { getLessons, getTopics } from "@/lib/content";
import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const LEARN_FAQS = [
  {
    question: "Can I learn Excel online free?",
    answer:
      "Yes. The course catalog, interactive lessons, practice exercises, function guides and how-to articles are free to use in your browser.",
  },
  {
    question: "Do I need Excel installed to take the lessons?",
    answer:
      "No. Lessons run in a browser-based spreadsheet, so you can learn on a laptop, Chromebook or computer without installing Microsoft Excel.",
  },
  {
    question: "How long does it take to learn Excel?",
    answer:
      "Most learners can build useful spreadsheet confidence in a few weeks by doing one short lesson or practice session at a time. Advanced roles may take longer for lookups, dashboards and automation.",
  },
  {
    question: "Will these lessons help with Excel certification or interviews?",
    answer:
      "They cover the formulas, functions, lookups and shortcuts commonly assessed in Excel tests. For exam-specific preparation, use the certification prep page alongside the lessons.",
  },
  {
    question: "Where should a complete beginner start?",
    answer:
      "Start with SUM, COUNT and IF lessons, then move into VLOOKUP or XLOOKUP once basic formulas feel comfortable.",
  },
];

export const metadata = buildMetadata({
  title: "Learn Excel Online Free",
  description:
    "Learn Excel online free with a self-paced interactive course, practice exercises, formula guides, and keyboard shortcut drills.",
  path: "/learn",
});

export default function LearnPage() {
  const topics = getTopics();
  const lessons = getLessons();
  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={courseJsonLd({
          name: "Excel Practice Course",
          description: "Interactive Excel lessons covering formulas, functions and shortcuts.",
          path: "/learn",
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Lessons", path: "/learn" }]} />
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Course catalog
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Learn Excel online free
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Pick a track, then work through its lessons in order. Each one takes about five minutes.
        </p>
      </header>
      {topics.map((topic) => {
        const topicLessons = topic.lessons
          .map((slug) => lessons.find((l) => l.slug === slug))
          .filter((l) => l !== undefined);
        return (
          <section key={topic.slug}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold">
                {topic.name}
              </h2>
              <Badge tone="zinc">
                {topicLessons.length} lesson{topicLessons.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {topic.description}
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {topicLessons.map((lesson, i) => (
                <li key={lesson.slug}>
                  <Card href={`/lesson/${lesson.slug}`} className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-2">
                        {lesson.level !== "beginner" && (
                          <Badge tone="amber">PRO</Badge>
                        )}
                        <Badge tone={levelTone(lesson.level)}>{lesson.level}</Badge>
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {lesson.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Start lesson →
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <ContextualLinks
        title="Need Excel skills for a job or certification?"
        description="Pair the lessons with timed practice and assessment prep to turn knowledge into interview-ready speed."
        links={[
          {
            href: "/practice",
            label: "Take the practice test",
            description: "Free interactive Excel exercises",
          },
          {
            href: "/how-to/excel-interview-questions",
            label: "Excel interview questions",
            description: "See what employers ask",
          },
          {
            href: "/certification",
            label: "Certification prep",
            description: "Exam-focused practice paths",
          },
        ]}
      />
      <FaqSection faqs={LEARN_FAQS} title="Learning Excel online, answered" />
    </div>
  );
}
