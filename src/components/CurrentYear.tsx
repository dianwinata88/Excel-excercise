"use client";

import { useEffect, useState } from "react";

export function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  // Must run client-side: reading the clock during prerender is disallowed
  // under Cache Components. eslint-disable-next-line is required because
  // setting state in an effect is intentional here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
