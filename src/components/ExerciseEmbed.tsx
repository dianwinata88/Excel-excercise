import { getExercise } from "@/lib/content";

/**
 * Interactive exercise embed used by lessons and programmatic pages.
 * CONTRACT (do not change props): <ExerciseEmbed exerciseId="sum-column-01" />
 * The exercise engine implementation lives in src/components/exercise/.
 */
export function ExerciseEmbed({ exerciseId }: { exerciseId: string }) {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return null;
  }
  // Placeholder until the exercise engine lands — keeps pages buildable and
  // still shows the prompt to crawlers/users.
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm font-medium">{exercise.prompt}</p>
      <p className="mt-1 text-xs text-zinc-500">Interactive practice coming online.</p>
    </div>
  );
}
