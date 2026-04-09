import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { diseaseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (published !== null) where.published = published === "true";

  const diseases = await prisma.disease.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: diseases });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
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

  const existing = await prisma.disease.findUnique({ where: { slug } });
  if (existing) {
    return Response.json({ error: "Ce slug existe deja" }, { status: 409 });
  }

  const { images, ...diseaseData } = data;

  const disease = await prisma.disease.create({
    data: { ...diseaseData, slug },
  });

  if (images && images.length > 0) {
    await Promise.all(
      images.map((img) =>
        prisma.diseaseImage.create({ data: { ...img, diseaseId: disease.id } })
      )
    );
  }

  const created = await prisma.disease.findUnique({
    where: { id: disease.id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return Response.json({ data: created }, { status: 201 });
}
