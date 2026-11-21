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
    const fire = (el: Element) => {
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
        // Analytics blocked/failed — never break the interaction.
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      // Submit buttons are tracked on the form's submit event instead —
      // a click fires before browser validation, inflating the funnel.
      if (el instanceof HTMLButtonElement && el.type === "submit") return;
      fire(el);
    };
    const onSubmit = (e: SubmitEvent) => {
      const submitter = e.submitter;
      if (submitter?.hasAttribute("data-track")) fire(submitter);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
