import { prisma } from "@/lib/prisma";
import GuidesClient from "./guides-client";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { order: "asc" },
  });

  return <GuidesClient guides={guides} />;
}
