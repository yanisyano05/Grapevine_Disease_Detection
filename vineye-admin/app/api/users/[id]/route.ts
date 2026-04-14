import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { z } from "zod/v4";

const patchUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  banned: z.boolean().optional(),
  bannedReason: z.string().max(500).trim().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      banned: true,
      bannedReason: true,
      createdAt: true,
      scans: {
        select: {
          id: true,
          confidence: true,
          createdAt: true,
          disease: { select: { name: true, severity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { scans: true } },
    },
  });

  if (!user) {
    return Response.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return Response.json({ data: user });
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

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const result = patchUserSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: result.data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      bannedReason: true,
    },
  });

  return Response.json({ data: user });
}
