"use client";

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../../../content/schema";
import {
  checkCellSelect,
  checkFormula,
  checkMcq,
  checkShortcut,
  eventToCombo,
} from "./engine";
import { awardXp, useProgress } from "./progress";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

type Status = "idle" | "wrong" | "correct";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** True when the user prefers reduced motion — skip decorative animations. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Props = {
  exercise: Exercise;
  /**
   * Lesson-player mode: report each submitted answer and let the parent
   * decide when to advance. In standalone mode (embed/practice) the card
   * shows its own XP toast and reset button.
   */
  onResult?: (correct: boolean) => void;
  standalone?: boolean;
};

export function ExerciseCard({ exercise, onResult, standalone = true }: Props) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [granted, setGranted] = useState(0);
  const progress = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Only autofocus when this is the only exercise card on the page (lesson
    // player or a single embed). Boards with many cards mounted would
    // otherwise have the last card win focus and scroll the page.
    if (document.querySelectorAll("[data-exercise]").length > 1) return;
    if (exercise.type === "formula") inputRef.current?.focus();
    if (exercise.type === "shortcut") shortcutRef.current?.focus();
    if (exercise.type === "mcq") firstOptionRef.current?.focus();
  }, [exercise.id, exercise.type]);

  function animate(keyframes: Keyframe[], duration = 300) {
    if (prefersReducedMotion()) return;
    cardRef.current?.animate(keyframes, { duration, easing: "ease-out" });
  }

  function finish(result: { ok: boolean; message?: string }) {
    if (result.ok) {
      const { granted: g } = awardXp(exercise.id, exercise.xp);
      setGranted(g);
      setStatus("correct");
      setMessage(null);
      onResult?.(true);
      animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.015)", offset: 0.6 },
          { transform: "scale(1)" },
        ],
        280,
      );
    } else {
      setStatus("wrong");
      setMessage(result.message ?? "Try again.");
      onResult?.(false);
      animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(0)" },
        ],
        350,
      );
    }
  }

  /** Insert a clicked cell's A1 reference into the formula at the caret. */
  function insertRef(ref: string) {
    const el = inputRef.current;
    const start = el?.selectionStart ?? input.length;
    const end = el?.selectionEnd ?? input.length;
    setInput(input.slice(0, start) + ref + input.slice(end));
    setStatus("idle");
    setMessage(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + ref.length, start + ref.length);
    });
  }

  function submit() {
    if (exercise.type === "formula") finish(checkFormula(exercise, input));
    else if (exercise.type === "cell-select" && selected) {
      finish(checkCellSelect(exercise, selected));
    } else if (exercise.type === "mcq" && picked !== null) {
      finish(checkMcq(exercise, picked));
    }
  }

  function reset() {
    setInput("");
    setStatus("idle");
    setMessage(null);
    setSelected(null);
    setPicked(null);
    setGranted(0);
  }

  const done = status === "correct";
  const alreadyDone = progress.completed.includes(exercise.id);

  const cardBorder = done
    ? "border-emerald-400 dark:border-emerald-700"
    : status === "wrong"
      ? "border-red-300 dark:border-red-800"
      : "border-zinc-200 dark:border-zinc-700";

  return (
    <section
      ref={cardRef}
      className={`rounded-xl border bg-white p-4 transition-colors duration-300 dark:bg-zinc-900 ${cardBorder}`}
      data-exercise={exercise.id}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{exercise.prompt}</p>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {exercise.xp} XP
        </span>
      </div>

      {/* Formula bar above the sheet, like Excel's fx bar */}
      {exercise.type === "formula" && (
        <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <label
            htmlFor={`fx-${exercise.id}`}
            className="font-mono text-sm text-zinc-500 sm:w-14 sm:shrink-0"
          >
            {exercise.answerCell} =
          </label>
          <input
            id={`fx-${exercise.id}`}
            ref={inputRef}
            value={input}
            disabled={done}
            aria-invalid={status === "wrong"}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a formula"
            spellCheck={false}
            autoComplete="off"
            className={`min-h-11 flex-1 rounded-lg border bg-white px-3 py-2 font-mono text-sm dark:bg-zinc-950 ${FOCUS_RING} disabled:opacity-60 ${
              status === "wrong"
                ? "border-red-400 dark:border-red-700"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          />
        </div>
      )}

      <div className="mt-3">
        <SpreadsheetGrid
          exercise={exercise}
          selected={selected}
          onSelect={(ref) => {
            if (done) return;
            if (exercise.type === "formula") {
              insertRef(ref);
              return;
            }
            setSelected(ref);
            setStatus("idle");
            setMessage(null);
          }}
        />
      </div>

      {exercise.type === "shortcut" && (
        <div
          ref={shortcutRef}
          tabIndex={0}
          role="button"
          aria-label="Shortcut capture area — press the key combination"
          onKeyDown={(e) => {
            if (done) return;
            const combo = eventToCombo(e);
            if (!combo) return;
            e.preventDefault();
            finish(checkShortcut(exercise, combo));
          }}
          className={`mt-3 min-h-11 rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 ${FOCUS_RING} dark:border-zinc-700`}
        >
          {done ? "Done!" : "Click here, then press the key combination"}
        </div>
      )}

      {exercise.type === "cell-select" && (
        <p className="mt-3 text-sm text-zinc-500">
          {done ? `Selected ${selected}` : "Click a cell in the grid above to answer."}
        </p>
      )}

      {exercise.type === "mcq" && (
        <ul className="mt-3 space-y-2">
          {(exercise.options ?? []).map((opt, i) => {
            const isPicked = picked === i;
            const good = done && i === exercise.correctOption;
            const bad = isPicked && status === "wrong";
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={done}
                  ref={i === 0 ? firstOptionRef : undefined}
                  aria-pressed={isPicked}
                  onClick={() => {
                    setPicked(i);
                    setStatus("idle");
                  }}
                  className={`min-h-11 w-full rounded-lg border px-3 py-2 text-left font-mono text-sm ${FOCUS_RING} disabled:cursor-default disabled:opacity-70 ${
                    good
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50"
                      : bad
                        ? "border-red-400 bg-red-50 dark:bg-red-950/40"
                        : isPicked
                          ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
                          : "border-zinc-300 hover:border-emerald-300 dark:border-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Feedback + actions */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {!done && exercise.type !== "shortcut" && (
          <button
            type="button"
            onClick={submit}
            disabled={
              (exercise.type === "formula" && !input.trim()) ||
              (exercise.type === "cell-select" && !selected) ||
              (exercise.type === "mcq" && picked === null)
            }
            className={`min-h-11 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Check
          </button>
        )}
        <div aria-live="polite" className="flex items-center gap-1.5">
          {status === "wrong" && message && (
            <p
              key={`wrong-${message}`}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
              role="alert"
            >
              <XIcon />
              {message}
            </p>
          )}
          {done && (
            <p
              className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
              role="status"
            >
              <CheckIcon />
              Correct{granted > 0 ? ` — +${granted} XP` : alreadyDone ? " (already completed)" : "!"}
            </p>
          )}
        </div>
        {done && standalone && (
          <button
            type="button"
            onClick={reset}
            className={`min-h-11 rounded-lg px-3 text-sm text-zinc-500 underline hover:text-zinc-700 ${FOCUS_RING} dark:hover:text-zinc-300`}
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}
