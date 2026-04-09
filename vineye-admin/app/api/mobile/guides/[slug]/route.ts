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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { order: "asc" } },
    },
  });

  if (!guide || !guide.published) {
    return Response.json(
      { success: false, error: "Guide introuvable" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const { published: _, updatedAt: __, ...data } = guide;

  return Response.json(
    { success: true, data },
    { headers: CORS_HEADERS },
  );
}
