import type { ReactNode } from "react";

const tones = {
  green:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
} as const;

export type BadgeTone = keyof typeof tones;

export function levelTone(level: string): BadgeTone {
  switch (level) {
    case "intermediate":
      return "amber";
    case "advanced":
      return "sky";
    default:
      return "green";
  }
}

export function Badge({
  tone = "zinc",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
