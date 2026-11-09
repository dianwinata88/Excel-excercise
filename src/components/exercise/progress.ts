"use client";

import { useSyncExternalStore } from "react";

/**
 * XP / streak / completion tracking in localStorage, exposed as an external
 * store so every component stays in sync and hydration stays clean
 * (server snapshot is empty; client snapshot reads real progress).
 */

const KEY = "excel-practice:progress";

export type Progress = {
  xp: number;
  completed: string[]; // exercise ids
  lastPlayedDay: string | null; // YYYY-MM-DD
  streakDays: number;
};

const EMPTY: Progress = { xp: 0, completed: [], lastPlayedDay: null, streakDays: 0 };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Progress>) : {};
    cache = {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      lastPlayedDay: typeof parsed.lastPlayedDay === "string" ? parsed.lastPlayedDay : null,
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 0,
    };
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function save(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // private mode / quota — progress just won't persist
  }
}

function notify() {
  cache = null;
  for (const l of listeners) l();
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

/**
 * Award XP for solving an exercise. XP is only granted the first time an
 * exercise is completed. Streak advances once per calendar day.
 * Returns the updated progress and how much XP was actually granted.
 */
export function awardXp(exerciseId: string, xp: number): { progress: Progress; granted: number } {
  const p = { ...loadProgress(), completed: [...loadProgress().completed] };
  const already = p.completed.includes(exerciseId);
  if (!already) {
    p.xp += xp;
    p.completed.push(exerciseId);
  }
  const today = todayKey();
  if (p.lastPlayedDay !== today) {
    p.streakDays = p.lastPlayedDay === yesterdayKey() ? p.streakDays + 1 : 1;
    p.lastPlayedDay = today;
  }
  save(p);
  notify();
  return { progress: p, granted: already ? 0 : xp };
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, loadProgress, () => EMPTY);
}
