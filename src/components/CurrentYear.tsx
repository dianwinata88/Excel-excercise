"use client";

import { useSyncExternalStore } from "react";

export function CurrentYear() {
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
