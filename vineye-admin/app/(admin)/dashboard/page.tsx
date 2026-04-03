import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalUsers, totalDiseases, activeAlerts, scansThisMonth, recentScans, topDiseases] =
    await Promise.all([
      prisma.user.count(),
      prisma.disease.count(),
      prisma.seasonAlert.count({ where: { active: true } }),
      prisma.scan.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.scan.findMany({
        select: {
          id: true,
          confidence: true,
          createdAt: true,
          user: { select: { name: true } },
          disease: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.scan
        .groupBy({
          by: ["diseaseId"],
          _count: { id: true },
          where: { diseaseId: { not: null } },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        })
        .then(async (stats) => {
          const ids = stats
            .map((s) => s.diseaseId)
            .filter((id): id is string => id !== null);
          const diseases = await prisma.disease.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true },
          });
          return stats.map((stat) => ({
            name: diseases.find((d) => d.id === stat.diseaseId)?.name || "Inconnu",
            count: stat._count.id,
          }));
        }),
    ]);

  const formattedScans = recentScans.map((scan) => ({
    id: scan.id,
    userName: scan.user.name,
    diseaseName: scan.disease?.name || "Non identifie",
    confidence: Math.round(scan.confidence * 100),
    date: formatDate(scan.createdAt),
  }));

  return (
    <DashboardClient
      stats={{
        totalUsers,
        scansThisMonth,
        totalDiseases,
        activeAlerts,
      }}
      recentScans={formattedScans}
      topDiseases={topDiseases}
    />
  );
}
