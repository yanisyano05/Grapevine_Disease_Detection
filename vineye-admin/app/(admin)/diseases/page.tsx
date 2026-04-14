import { prisma } from "@/lib/prisma";
import DiseasesClient from "./diseases-client";

export const dynamic = "force-dynamic";

export default async function DiseasesPage() {
  const diseases = await prisma.disease.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      scientificName: true,
      slug: true,
      type: true,
      severity: true,
      published: true,
      createdAt: true,
      _count: { select: { scans: true } },
    },
  });

  return <DiseasesClient diseases={diseases} />;
}
