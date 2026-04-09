import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { alertSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const alert = await prisma.seasonAlert.findUnique({ where: { id } });
  if (!alert) {
    return Response.json({ error: "Alerte introuvable" }, { status: 404 });
  }

  return Response.json({ data: alert });
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
  const existing = await prisma.seasonAlert.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Alerte introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const result = alertSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const alert = await prisma.seasonAlert.update({
    where: { id },
    data: result.data,
  });

  return Response.json({ data: alert });
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
  const existing = await prisma.seasonAlert.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Alerte introuvable" }, { status: 404 });
  }

  const body = await request.json();

  if (typeof body.active !== "boolean") {
    return Response.json({ error: "Champ 'active' requis" }, { status: 400 });
  }

  const alert = await prisma.seasonAlert.update({
    where: { id },
    data: { active: body.active },
  });

  return Response.json({ data: alert });
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
  const existing = await prisma.seasonAlert.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Alerte introuvable" }, { status: 404 });
  }

  await prisma.seasonAlert.delete({ where: { id } });
  return Response.json({ message: "Alerte supprimee" });
}
