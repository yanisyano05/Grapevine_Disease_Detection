import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { scanSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const [totalScans, scansThisMonth, recentScans, diseaseStats] = await Promise.all([
    prisma.scan.count(),
    prisma.scan.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.scan.findMany({
      select: {
        id: true,
        confidence: true,
        createdAt: true,
        user: { select: { name: true } },
        disease: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.scan.groupBy({
      by: ["diseaseId"],
      _count: { id: true },
      where: { diseaseId: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  // Resolve disease names for stats
  const diseaseIds = diseaseStats
    .map((s) => s.diseaseId)
    .filter((id): id is string => id !== null);

  const diseases = await prisma.disease.findMany({
    where: { id: { in: diseaseIds } },
    select: { id: true, name: true },
  });

  const topDiseases = diseaseStats.map((stat) => ({
    name: diseases.find((d) => d.id === stat.diseaseId)?.name || "Inconnu",
    count: stat._count.id,
  }));

  return Response.json({
    data: {
      totalScans,
      scansThisMonth,
      recentScans,
      topDiseases,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const result = scanSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const scan = await prisma.scan.create({
    data: {
      ...result.data,
      userId: auth.session.user.id,
    },
  });

  return Response.json({ data: scan }, { status: 201 });
}
