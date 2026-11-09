import { z } from "zod";

// ---- Content model -------------------------------------------------------
// All programmatic pages and lessons are generated from these data files.
// Run `npm run validate:content` to check every file against these schemas.

export const TopicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(), // e.g. "Lookup"
  title: z.string(), // SEO title for /learn/<topic>
  description: z.string(),
  lessons: z.array(z.string()), // lesson slugs, in order
});
export type Topic = z.infer<typeof TopicSchema>;

export const ExerciseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(["formula", "shortcut", "mcq", "cell-select"]),
  prompt: z.string(),
  // Initial grid contents for the exercise. Keys are A1-style cell refs.
  grid: z.record(z.string(), z.union([z.string(), z.number()])),
  // Cell the user writes into (formula exercises).
  answerCell: z.string().optional(),
  // Expected computed value in answerCell after the user's formula.
  expectValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  // Function names the answer must use (formula exercises).
  acceptFns: z.array(z.string()).default([]),
  // Correct key combo for shortcut exercises, e.g. "ctrl+b".
  keys: z.string().optional(),
  // Options + index of correct answer for mcq exercises.
  options: z.array(z.string()).optional(),
  correctOption: z.number().optional(),
  hints: z.array(z.string()).default([]),
  xp: z.number().int().positive().default(10),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const LessonSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  topic: z.string(), // topic slug
  title: z.string(),
  description: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  exercises: z.array(z.string()), // exercise ids, in order
});
export type Lesson = z.infer<typeof LessonSchema>;

export const FunctionDocSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), // e.g. "sum", "vlookup"
  name: z.string(), // "SUM"
  category: z.string(), // "Math", "Lookup", "Text"...
  syntax: z.string(), // "SUM(number1, [number2], ...)"
  params: z.array(z.object({ name: z.string(), required: z.boolean(), description: z.string() })),
  summary: z.string(), // one-line description
  intro: z.string(), // unique paragraph for the page
  examples: z.array(
    z.object({
      title: z.string(),
      grid: z.record(z.string(), z.union([z.string(), z.number()])),
      formula: z.string(),
      result: z.union([z.string(), z.number()]),
      note: z.string().optional(),
    }),
  ),
  commonErrors: z.array(z.object({ error: z.string(), cause: z.string(), fix: z.string() })).default([]),
  relatedFunctions: z.array(z.string()).default([]),
  relatedLessons: z.array(z.string()).default([]),
  exerciseId: z.string().optional(), // embedded "try it" exercise
});
export type FunctionDoc = z.infer<typeof FunctionDocSchema>;

export const TaskDocSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), // e.g. "extract-last-word"
  task: z.string(), // "Extract the last word from text"
  intro: z.string(),
  steps: z.array(z.object({ heading: z.string(), body: z.string() })),
  formulas: z.array(z.object({ formula: z.string(), explanation: z.string() })).default([]),
  relatedFunctions: z.array(z.string()).default([]),
  relatedLessons: z.array(z.string()).default([]),
});
export type TaskDoc = z.infer<typeof TaskDocSchema>;

export const ShortcutDocSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), // e.g. "bold"
  action: z.string(), // "Bold selection"
  keys: z.object({ windows: z.string(), mac: z.string() }),
  description: z.string(),
  tips: z.array(z.string()).default([]),
  relatedShortcuts: z.array(z.string()).default([]),
});
export type ShortcutDoc = z.infer<typeof ShortcutDocSchema>;
