"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export function LeadCaptureForm({
  source = "newsletter",
  heading = "Get one Excel tip in your inbox every week",
  ctaLabel = "Subscribe",
}: {
  /** Stored on the Lead row so we know where the signup came from. */
  source?: string;
  heading?: string;
  ctaLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    // Static preview build: no backend — simulate a successful signup.
    await new Promise((r) => setTimeout(r, 400));
    setStatus("success");
    setEmail("");
  }

  return (
    <div>
      {heading && (
        <p className="text-center text-lg font-semibold text-emerald-950 dark:text-emerald-100">
          {heading}
        </p>
      )}
      <form
        onSubmit={onSubmit}
        className="mx-auto mt-4 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="lead-email" className="sr-only">
          Email address
        </label>
        <input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-900"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
        >
          {status === "submitting" ? "Joining…" : ctaLabel}
        </button>
      </form>
      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-center text-sm"
      >
        {status === "success" && (
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            You&apos;re in — check your inbox for the first tip.
          </span>
        )}
        {status === "duplicate" && (
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            You&apos;re already subscribed — you&apos;re all set.
          </span>
        )}
        {status === "error" && (
          <span className="font-medium text-red-600 dark:text-red-400">
            Something went wrong — please check your email and try again.
          </span>
        )}
        {status === "idle" && (
          <span className="text-emerald-900/70 dark:text-emerald-200/70">
            Free, one email a week, unsubscribe anytime.
          </span>
        )}
      </p>
    </div>
  );
}
