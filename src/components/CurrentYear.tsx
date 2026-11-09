"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function CurrentYear() {
  const year = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
