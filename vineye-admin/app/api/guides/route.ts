import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { guideSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (published !== null) where.published = published === "true";

  const guides = await prisma.guide.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return Response.json({ data: guides });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const result = guideSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;
  const slug = data.slug || slugify(data.title);

  const existing = await prisma.guide.findUnique({ where: { slug } });
  if (existing) {
    return Response.json({ error: "Ce slug existe deja" }, { status: 409 });
  }

  const guide = await prisma.guide.create({
    data: { ...data, slug },
  });

  return Response.json({ data: guide }, { status: 201 });
}
