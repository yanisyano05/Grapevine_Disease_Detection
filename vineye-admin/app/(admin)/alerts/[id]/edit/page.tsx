import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AlertForm from "@/components/admin/alert-form";

export default async function EditAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const alert = await prisma.seasonAlert.findUnique({ where: { id } });
  if (!alert) notFound();

  return (
    <AlertForm
      mode="edit"
      initialData={{
        id: alert.id,
        title: alert.title,
        titleEn: alert.titleEn,
        message: alert.message,
        messageEn: alert.messageEn,
        type: alert.type,
        region: alert.region,
        active: alert.active,
        activeFrom: alert.activeFrom.toISOString().split("T")[0],
        activeTo: alert.activeTo ? alert.activeTo.toISOString().split("T")[0] : "",
      }}
    />
  );
}
