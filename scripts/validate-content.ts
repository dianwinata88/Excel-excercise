/**
 * Validates every content/*.json file against the zod schemas.
 * Run: npx tsx scripts/validate-content.ts
 */
import {
  getCertificationDocs,
  getComparisonDocs,
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
const tasks = getTaskDocs();
const taskSlugs = new Set(tasks.map((t) => t.slug));
const shortcuts = getShortcutDocs();
const shortcutSlugs = new Set(shortcuts.map((s) => s.slug));
const comparisons = getComparisonDocs();
const comparisonSlugs = new Set(comparisons.map((c) => c.slug));
const certifications = getCertificationDocs();
const certificationSlugs = new Set(certifications.map((c) => c.slug));

const errors: string[] = [];

function checkUnique(label: string, slugs: string[]) {
  const seen = new Set<string>();
  for (const s of slugs) {
    if (seen.has(s)) errors.push(`${label}: duplicate slug ${s}`);
    seen.add(s);
  }
}
checkUnique("topics", topics.map((t) => t.slug));
checkUnique("lessons", lessons.map((l) => l.slug));
checkUnique("exercises", exercises.map((e) => e.id));
checkUnique("functions", functions.map((f) => f.slug));
checkUnique("tasks", tasks.map((t) => t.slug));
checkUnique("shortcuts", shortcuts.map((s) => s.slug));
checkUnique("comparisons", comparisons.map((c) => c.slug));
checkUnique("certifications", certifications.map((c) => c.slug));

for (const lesson of lessons) {
  if (!topicSlugs.has(lesson.topic)) errors.push(`lesson ${lesson.slug}: unknown topic ${lesson.topic}`);
  for (const id of lesson.exercises) if (!exerciseIds.has(id)) errors.push(`lesson ${lesson.slug}: unknown exercise ${id}`);
  for (const rel of lesson.relatedFunctions) if (!functionSlugs.has(rel)) errors.push(`lesson ${lesson.slug}: unknown related function ${rel}`);
  for (const rel of lesson.relatedTasks) if (!taskSlugs.has(rel)) errors.push(`lesson ${lesson.slug}: unknown related task ${rel}`);
  for (const rel of lesson.relatedLessons) if (!lessonSlugs.has(rel)) errors.push(`lesson ${lesson.slug}: unknown related lesson ${rel}`);
}
for (const topic of topics) {
  for (const slug of topic.lessons) if (!lessonSlugs.has(slug)) errors.push(`topic ${topic.slug}: unknown lesson ${slug}`);
}
for (const fn of functions) {
  for (const rel of fn.relatedFunctions) if (!functionSlugs.has(rel)) errors.push(`function ${fn.slug}: unknown related function ${rel}`);
  for (const rel of fn.relatedLessons) if (!lessonSlugs.has(rel)) errors.push(`function ${fn.slug}: unknown related lesson ${rel}`);
  if (fn.exerciseId && !exerciseIds.has(fn.exerciseId)) errors.push(`function ${fn.slug}: unknown exercise ${fn.exerciseId}`);
}
for (const task of tasks) {
  for (const rel of task.relatedFunctions) if (!functionSlugs.has(rel)) errors.push(`task ${task.slug}: unknown related function ${rel}`);
  for (const rel of task.relatedLessons) if (!lessonSlugs.has(rel)) errors.push(`task ${task.slug}: unknown related lesson ${rel}`);
}
for (const s of shortcuts) {
  for (const rel of s.relatedShortcuts) if (!shortcutSlugs.has(rel)) errors.push(`shortcut ${s.slug}: unknown related shortcut ${rel}`);
}
for (const c of comparisons) {
  for (const rel of c.relatedFunctions) if (!functionSlugs.has(rel)) errors.push(`comparison ${c.slug}: unknown related function ${rel}`);
  for (const rel of c.relatedComparisons) if (!comparisonSlugs.has(rel)) errors.push(`comparison ${c.slug}: unknown related comparison ${rel}`);
}
for (const cert of certifications) {
  for (const objective of cert.objectives) {
    for (const slug of objective.lessonSlugs) if (!lessonSlugs.has(slug)) errors.push(`certification ${cert.slug}: objective "${objective.name}" unknown lesson ${slug}`);
    for (const slug of objective.taskSlugs) if (!taskSlugs.has(slug)) errors.push(`certification ${cert.slug}: objective "${objective.name}" unknown task ${slug}`);
    for (const slug of objective.functionSlugs) if (!functionSlugs.has(slug)) errors.push(`certification ${cert.slug}: objective "${objective.name}" unknown function ${slug}`);
  }
  for (const rel of cert.related) if (!certificationSlugs.has(rel)) errors.push(`certification ${cert.slug}: unknown related certification ${rel}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `content OK: ${topics.length} topics, ${lessons.length} lessons, ${exercises.length} exercises, ` +
    `${functions.length} functions, ${tasks.length} tasks, ${shortcutSlugs.size} shortcuts, ${comparisons.length} comparisons, ${certifications.length} certifications`,
);
