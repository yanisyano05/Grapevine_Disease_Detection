import { prisma } from "@/lib/prisma";
import AlertsClient from "./alerts-client";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await prisma.seasonAlert.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AlertsClient alerts={alerts} />;
}
