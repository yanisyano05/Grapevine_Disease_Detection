import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { alertSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const region = searchParams.get("region");
  const active = searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (region) where.region = region;
  if (active !== null) where.active = active === "true";

  const alerts = await prisma.seasonAlert.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: alerts });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const result = alertSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const alert = await prisma.seasonAlert.create({
    data: result.data,
  });

  return Response.json({ data: alert }, { status: 201 });
}
