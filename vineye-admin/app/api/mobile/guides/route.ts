import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));

  const where: Record<string, unknown> = { published: true };
  if (category) {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { titleEn: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [guides, total] = await Promise.all([
    prisma.guide.findMany({
      where,
      include: {
        sections: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.guide.count({ where }),
  ]);

  const data = guides.map(({ published: _, updatedAt: __, ...g }) => g);

  return Response.json(
    { success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    { headers: CORS_HEADERS },
  );
}
