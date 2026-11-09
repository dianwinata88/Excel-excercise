import { getExercise } from "@/lib/content";
import { ExerciseCard } from "./exercise/ExerciseCard";

/**
 * Interactive exercise embed used by lessons and programmatic pages.
 * CONTRACT (do not change props): <ExerciseEmbed exerciseId="sum-column-01" />
 * This stays a Server Component: it resolves the exercise from content and
 * hands the serializable spec to the client engine in src/components/exercise/.
 */
export function ExerciseEmbed({ exerciseId }: { exerciseId: string }) {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return null;
  }
  return <ExerciseCard exercise={exercise} />;
}
