/**
 * Validates every content/*.json file against the zod schemas.
 * Run: npx tsx scripts/validate-content.ts
 */
import {
  getExercises,
  getFunctionDocs,
  getLessons,
  getShortcutDocs,
  getTaskDocs,
  getTopics,
} from "../src/lib/content";

const exercises = getExercises();
const exerciseIds = new Set(exercises.map((e) => e.id));
const lessons = getLessons();
const lessonSlugs = new Set(lessons.map((l) => l.slug));
const topics = getTopics();
const topicSlugs = new Set(topics.map((t) => t.slug));
const functions = getFunctionDocs();
const functionSlugs = new Set(functions.map((f) => f.slug));
const shortcuts = getShortcutDocs();
const shortcutSlugs = new Set(shortcuts.map((s) => s.slug));
getTaskDocs();

const errors: string[] = [];

for (const lesson of lessons) {
  if (!topicSlugs.has(lesson.topic)) errors.push(`lesson ${lesson.slug}: unknown topic ${lesson.topic}`);
  for (const id of lesson.exercises) if (!exerciseIds.has(id)) errors.push(`lesson ${lesson.slug}: unknown exercise ${id}`);
}
for (const topic of topics) {
  for (const slug of topic.lessons) if (!lessonSlugs.has(slug)) errors.push(`topic ${topic.slug}: unknown lesson ${slug}`);
}
for (const fn of functions) {
  for (const rel of fn.relatedFunctions) if (!functionSlugs.has(rel)) errors.push(`function ${fn.slug}: unknown related function ${rel}`);
  for (const rel of fn.relatedLessons) if (!lessonSlugs.has(rel)) errors.push(`function ${fn.slug}: unknown related lesson ${rel}`);
  if (fn.exerciseId && !exerciseIds.has(fn.exerciseId)) errors.push(`function ${fn.slug}: unknown exercise ${fn.exerciseId}`);
}
for (const s of shortcuts) {
  for (const rel of s.relatedShortcuts) if (!shortcutSlugs.has(rel)) errors.push(`shortcut ${s.slug}: unknown related shortcut ${rel}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `content OK: ${topics.length} topics, ${lessons.length} lessons, ${exercises.length} exercises, ` +
    `${functions.length} functions, ${shortcutSlugs.size} shortcuts`,
);
