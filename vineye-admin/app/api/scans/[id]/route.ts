import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      disease: { select: { name: true, severity: true } },
    },
  });

  if (!scan) {
    return Response.json({ error: "Scan introuvable" }, { status: 404 });
  }

  return Response.json({ data: scan });
}
