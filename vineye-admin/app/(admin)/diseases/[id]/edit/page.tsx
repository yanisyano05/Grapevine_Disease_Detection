import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DiseaseForm from "@/components/admin/disease-form";

export default async function EditDiseasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const disease = await prisma.disease.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!disease) notFound();

  return (
    <DiseaseForm
      mode="edit"
      initialData={{
        id: disease.id,
        name: disease.name,
        nameEn: disease.nameEn,
        scientificName: disease.scientificName,
        slug: disease.slug,
        type: disease.type,
        severity: disease.severity,
        description: disease.description,
        descriptionEn: disease.descriptionEn,
        symptoms: disease.symptoms,
        symptomsEn: disease.symptomsEn,
        treatment: disease.treatment,
        treatmentEn: disease.treatmentEn,
        season: disease.season,
        seasonEn: disease.seasonEn,
        iconName: disease.iconName,
        iconColor: disease.iconColor,
        bgColor: disease.bgColor,
        published: disease.published,
        startMonth: disease.startMonth,
        endMonth: disease.endMonth,
        peakMonth: disease.peakMonth,
        conditions: disease.conditions,
        conditionsEn: disease.conditionsEn,
        preventiveActions: disease.preventiveActions,
        preventiveActionsEn: disease.preventiveActionsEn,
        curativeActions: disease.curativeActions,
        curativeActionsEn: disease.curativeActionsEn,
        impactedParts: disease.impactedParts,
        impactedPartsEn: disease.impactedPartsEn,
        spreadMethod: disease.spreadMethod,
        spreadMethodEn: disease.spreadMethodEn,
        images: disease.images.map((img) => ({
          url: img.url,
          alt: img.alt ?? "",
          order: img.order,
        })),
      }}
    />
  );
}
