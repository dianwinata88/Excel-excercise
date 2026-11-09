import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PracticeBoard } from "@/components/exercise/PracticeBoard";
import { getExercises } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Free Excel Practice Sandbox",
  description: "Practice Excel formulas and shortcuts online — no download needed.",
  path: "/practice",
});

export default function PracticePage() {
  const exercises = getExercises();
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Practice", path: "/practice" }]} />
      <h1 className="text-3xl font-bold">Practice Excel online</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Jump into any exercise — everything runs in your browser. XP and your
        streak are saved on this device.
      </p>
      <PracticeBoard exercises={exercises} />
    </div>
  );
}
