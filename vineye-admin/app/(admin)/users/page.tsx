import { prisma } from "@/lib/prisma";
import UsersClient from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      banned: true,
      createdAt: true,
      _count: { select: { scans: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsersClient users={users} />;
}
