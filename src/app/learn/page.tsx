import { Badge, levelTone } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { getLessons, getTopics } from "@/lib/content";
import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata = buildMetadata({
  title: "All Excel Lessons",
  description: "Bite-sized interactive Excel lessons: formulas, functions and shortcuts.",
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
      <SectionHeading
        align="left"
        eyebrow="Course catalog"
        title="Excel lessons"
        description="Pick a track, then work through its lessons in order. Each one takes about five minutes."
      />
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
                      <Badge tone={levelTone(lesson.level)}>{lesson.level}</Badge>
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
    </div>
  );
}
