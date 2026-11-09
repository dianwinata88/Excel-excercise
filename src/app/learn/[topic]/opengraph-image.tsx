import { ImageResponse } from "next/og";
import { getTopic } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  const name = topic?.name ?? "Lessons";
  const description = topic?.description ?? "Interactive Excel lessons.";
  const count = topic?.lessons.length ?? 0;
  const lessonsLabel = `${count} lesson${count === 1 ? "" : "s"} · start free`;

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
          background: "linear-gradient(135deg, #064e3b 0%, #047857 60%, #10b981 100%)",
          fontFamily: "sans-serif",
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
            ∑
          </div>
          <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
            Excel Practice
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            SKILL TRACK
          </div>
          <div
            style={{
              color: "white",
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 32,
              maxWidth: 880,
            }}
          >
            {description}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: "white",
              color: "#047857",
              fontSize: 26,
              fontWeight: 700,
              padding: "12px 28px",
            }}
          >
            {lessonsLabel}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
