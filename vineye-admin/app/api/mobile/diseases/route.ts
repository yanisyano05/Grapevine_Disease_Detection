import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "X-API-Version": "1.0",
  "Cache-Control": "public, max-age=3600",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const severity = searchParams.get("severity")?.toUpperCase();
  const type = searchParams.get("type")?.toUpperCase();
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));

  const where: Record<string, unknown> = { published: true };
  if (severity && ["HIGH", "MEDIUM", "LOW"].includes(severity)) {
    where.severity = severity;
  }
  if (type && ["FUNGAL", "BACTERIAL", "PEST", "ABIOTIC"].includes(type)) {
    where.type = type;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
      { scientificName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [diseases, total] = await Promise.all([
    prisma.disease.findMany({
      where,
      select: {
        id: true, slug: true,
        name: true, nameEn: true, scientificName: true,
        type: true, severity: true,
        description: true, descriptionEn: true,
        symptoms: true, symptomsEn: true,
        treatment: true, treatmentEn: true,
        season: true, seasonEn: true,
        iconName: true, iconColor: true, bgColor: true,
        imageUrl: true, createdAt: true,
        startMonth: true, endMonth: true, peakMonth: true,
        conditions: true, conditionsEn: true,
        preventiveActions: true, preventiveActionsEn: true,
        curativeActions: true, curativeActionsEn: true,
        impactedParts: true, impactedPartsEn: true,
        spreadMethod: true, spreadMethodEn: true,
        images: { select: { id: true, url: true, alt: true, order: true }, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.disease.count({ where }),
  ]);

  // Sort by severity (HIGH first)
  diseases.sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] ?? 3;
    const bOrder = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] ?? 3;
    return aOrder - bOrder;
  });

  return Response.json(
    { success: true, data: diseases, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    { headers: CORS_HEADERS },
  );
}
