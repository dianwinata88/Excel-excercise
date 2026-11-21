"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Fires a Vercel Web Analytics custom event for any click on an element
 * with `data-track="<event>"`; `data-track-prop-*` attributes become
 * event properties (e.g. data-track-prop-plan="monthly" → {plan:"monthly"}).
 * Lets server components emit funnel events with plain HTML attributes.
 */
export function AnalyticsTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      const name = el.getAttribute("data-track");
      if (!name) return;
      const props: Record<string, string> = {};
      for (const attr of el.attributes) {
        if (attr.name.startsWith("data-track-prop-")) {
          props[attr.name.slice("data-track-prop-".length)] = attr.value;
        }
      }
      try {
        track(name, props);
      } catch {
        // Analytics blocked/failed — never break a click.
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
