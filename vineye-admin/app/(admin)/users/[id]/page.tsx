import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserDetailClient from "./user-detail-client";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!user) notFound();

  return <UserDetailClient user={user} />;
}
