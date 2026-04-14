import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { guideSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) {
    return Response.json({ error: "Guide introuvable" }, { status: 404 });
  }

  return Response.json({ data: guide });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Guide introuvable" }, { status: 404 });
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

  const slugConflict = await prisma.guide.findFirst({
    where: { slug, id: { not: id } },
  });
  if (slugConflict) {
    return Response.json({ error: "Ce slug existe deja" }, { status: 409 });
  }

  const guide = await prisma.guide.update({
    where: { id },
    data: { ...data, slug },
  });

  return Response.json({ data: guide });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Guide introuvable" }, { status: 404 });
  }

  await prisma.guide.delete({ where: { id } });
  return Response.json({ message: "Guide supprime" });
}
