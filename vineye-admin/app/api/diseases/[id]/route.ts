import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { diseaseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const disease = await prisma.disease.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!disease) {
    return Response.json({ error: "Maladie introuvable" }, { status: 404 });
  }

  return Response.json({ data: disease });
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
  const existing = await prisma.disease.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Maladie introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const result = diseaseSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;
  const slug = data.slug || slugify(data.name);

  const slugConflict = await prisma.disease.findFirst({
    where: { slug, id: { not: id } },
  });
  if (slugConflict) {
    return Response.json({ error: "Ce slug existe deja" }, { status: 409 });
  }

  const { images, ...diseaseData } = data;

  const disease = await prisma.disease.update({
    where: { id },
    data: { ...diseaseData, slug },
  });

  // Handle images: delete old, create new
  if (images && images.length > 0) {
    await prisma.diseaseImage.deleteMany({ where: { diseaseId: id } });
    await Promise.all(
      images.map((img) =>
        prisma.diseaseImage.create({ data: { ...img, diseaseId: id } })
      )
    );
  }

  const updated = await prisma.disease.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return Response.json({ data: updated });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const existing = await prisma.disease.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Maladie introuvable" }, { status: 404 });
  }

  const body = await request.json();

  // Only allow toggling published
  if (typeof body.published !== "boolean") {
    return Response.json({ error: "Champ 'published' requis" }, { status: 400 });
  }

  const disease = await prisma.disease.update({
    where: { id },
    data: { published: body.published },
  });

  return Response.json({ data: disease });
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
  const existing = await prisma.disease.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Maladie introuvable" }, { status: 404 });
  }

  await prisma.disease.delete({ where: { id } });
  return Response.json({ message: "Maladie supprimee" });
}
