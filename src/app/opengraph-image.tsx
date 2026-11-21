import { ImageResponse } from "next/og";

export const alt = "Excel Practice — Learn Excel by doing, not watching";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #065f46 0%, #059669 55%, #10b981 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            ∑
          </div>
          <div style={{ color: "white", fontSize: 32, fontWeight: 700 }}>
            Excel Practice
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "white",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Learn Excel by doing — not watching
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 32,
              maxWidth: 820,
            }}
          >
            Bite-sized interactive exercises that run right in your browser. Real
            formulas, real shortcuts, real feedback.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: "white",
              color: "#047857",
              fontSize: 28,
              fontWeight: 700,
              padding: "14px 32px",
            }}
          >
            Start practicing — it&apos;s free
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 26 }}>
            No sign-up · No download
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
