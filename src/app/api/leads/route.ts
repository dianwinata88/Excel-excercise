import { z } from "zod";
import { getPrisma } from "@/lib/db";

const LeadInput = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "source must be kebab-case")
    .max(64)
    .optional()
    .default("newsletter"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = LeadInput.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const { email, source } = parsed.data;
  const prisma = getPrisma();

  try {
    await prisma.lead.create({ data: { email, source } });
    return Response.json({ status: "subscribed" }, { status: 201 });
  } catch (err) {
    // P2002 = unique constraint violation on Lead.email
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return Response.json({ status: "already-registered" }, { status: 200 });
    }
    console.error("Failed to store lead", err);
    return Response.json({ error: "Could not save subscription" }, { status: 500 });
  }
}
