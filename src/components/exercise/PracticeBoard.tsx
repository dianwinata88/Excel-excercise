"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Exercise } from "../../../content/schema";
import { ExerciseCard } from "./ExerciseCard";
import { useProgress } from "./progress";

const TYPES = ["all", "formula", "shortcut", "mcq", "cell-select"] as const;
type TypeFilter = (typeof TYPES)[number];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400";

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 1a4 4 0 0 0-4 4v3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 7V5a2 2 0 1 0-4 0v3h4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Free practice mode: filter exercises by type, see which are done,
 * run through them with the same engine as lessons.
 */
export function PracticeBoard({
  exercises,
  lockedIds,
}: {
  exercises: Exercise[];
  lockedIds?: Set<string>;
}) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const progress = useProgress();

  const done = useMemo(() => new Set(progress.completed), [progress]);
  const visible = exercises.filter((e) => filter === "all" || e.type === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium ${FOCUS_RING} ${
              filter === t
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 text-zinc-600 hover:border-emerald-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
        <span className="ml-auto text-sm text-zinc-500">
          {progress.xp} XP · {progress.streakDays}-day streak · {done.size}/
          {exercises.length} done
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {visible.map((e) => {
          const locked = lockedIds?.has(e.id);
          return (
            <div key={e.id} className="relative">
              {done.has(e.id) && (
                <span className="absolute -top-2 right-3 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                  done
                </span>
              )}
              {locked ? (
                <Link
                  href="/upgrade"
                  aria-label={`${e.prompt} — locked, Pro only. Opens upgrade page.`}
                  className={`flex items-center justify-between gap-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-4 opacity-80 transition hover:border-amber-400 hover:opacity-100 ${FOCUS_RING} dark:border-amber-800 dark:bg-amber-950/20`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                      <LockIcon />
                    </span>
                    <div className="min-w-0">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        PRO
                      </span>
                      <p className="mt-1 font-medium text-zinc-500 dark:text-zinc-400">
                        {e.prompt}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Unlock with Pro →
                  </span>
                </Link>
              ) : (
                <ExerciseCard exercise={e} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
