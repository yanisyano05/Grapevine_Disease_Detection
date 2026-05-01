import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/auth-guard";
import { mobileScanCreateSchema } from "@/lib/validations";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-API-Version": "1.0",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const guard = await requireMobileAuth(request);
  if ("error" in guard) {
    return Response.json(
      "banned" in guard
        ? { error: guard.error, banned: true, bannedReason: guard.bannedReason }
        : { error: guard.error },
      { status: guard.status, headers: CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = mobileScanCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { confidence, diseaseSlug, latitude, longitude, deviceId } =
    parsed.data;

  let diseaseId: string | null = null;
  if (diseaseSlug) {
    const disease = await prisma.disease.findUnique({
      where: { slug: diseaseSlug },
      select: { id: true },
    });
    diseaseId = disease?.id ?? null;
  }

  const scan = await prisma.scan.create({
    data: {
      userId: guard.user.id,
      confidence,
      diseaseId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      deviceId: deviceId ?? null,
      imageUrl: null,
    },
    select: {
      id: true,
      confidence: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      disease: { select: { slug: true, name: true } },
    },
  });

  return Response.json({ scan }, { status: 201, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const guard = await requireMobileAuth(request);
  if ("error" in guard) {
    return Response.json(
      "banned" in guard
        ? { error: guard.error, banned: true, bannedReason: guard.bannedReason }
        : { error: guard.error },
      { status: guard.status, headers: CORS_HEADERS },
    );
  }

  const scans = await prisma.scan.findMany({
    where: { userId: guard.user.id },
    select: {
      id: true,
      confidence: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      disease: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json({ scans }, { headers: CORS_HEADERS });
}
