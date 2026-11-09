import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExerciseEmbed } from "@/components/ExerciseEmbed";
import { getLesson, getLessons, getTopic } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getLessons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return buildMetadata({
    title: `${lesson.title} — Interactive Excel Lesson`,
    description: lesson.description,
    path: `/lesson/${slug}`,
  });
}

export default async function LessonPage({ params }: PageProps<"/lesson/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const topic = getTopic(lesson.topic);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Lessons", path: "/learn" },
          ...(topic ? [{ name: topic.name, path: `/learn/${topic.slug}` }] : []),
          { name: lesson.title, path: `/lesson/${slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold">{lesson.title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
      {/* The lesson player replaces this static list in the exercise-engine work. */}
      {lesson.exercises.map((id) => (
        <ExerciseEmbed key={id} exerciseId={id} />
      ))}
    </div>
  );
}
