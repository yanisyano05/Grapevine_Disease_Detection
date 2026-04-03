import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DiseaseForm from "@/components/admin/disease-form";

export default async function EditDiseasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const disease = await prisma.disease.findUnique({ where: { id } });
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
      }}
    />
  );
}
