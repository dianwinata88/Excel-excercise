import { ImageResponse } from "next/og";
import { getFunctionDoc } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn: slug } = await params;
  const fn = getFunctionDoc(slug);
  const name = fn?.name ?? slug.toUpperCase();
  const summary = fn?.summary ?? "Excel function guide with examples.";
  const syntax = fn?.syntax ?? "";
  const category = fn?.category ?? "Function";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #052e16 0%, #065f46 60%, #059669 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                color: "white",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              fx
            </div>
            <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
              Excel Practice
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.4)",
              color: "white",
              fontSize: 22,
              padding: "8px 24px",
            }}
          >
            {category}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "white",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {`${name}()`}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 32,
              maxWidth: 900,
            }}
          >
            {summary}
          </div>
          {syntax && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: 12,
                background: "rgba(0,0,0,0.3)",
                color: "#a7f3d0",
                fontSize: 26,
                fontFamily: "monospace",
                padding: "12px 24px",
              }}
            >
              {syntax}
            </div>
          )}
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 26 }}>
          Syntax · Examples · Common errors · Hands-on exercise
        </div>
      </div>
    ),
    { ...size },
  );
}
