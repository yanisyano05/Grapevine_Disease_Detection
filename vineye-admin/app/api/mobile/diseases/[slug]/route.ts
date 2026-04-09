import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "X-API-Version": "1.0",
  "Cache-Control": "public, max-age=3600",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const disease = await prisma.disease.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!disease || !disease.published) {
      return Response.json(
        { success: false, error: "Maladie introuvable" },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    // Sort images by order
    disease.images.sort((a, b) => a.order - b.order);

    return Response.json(
      {
        success: true,
        data: {
          id: disease.id, slug: disease.slug,
          name: disease.name, nameEn: disease.nameEn,
          scientificName: disease.scientificName,
          type: disease.type, severity: disease.severity,
          description: disease.description, descriptionEn: disease.descriptionEn,
          symptoms: disease.symptoms, symptomsEn: disease.symptomsEn,
          treatment: disease.treatment, treatmentEn: disease.treatmentEn,
          season: disease.season, seasonEn: disease.seasonEn,
          iconName: disease.iconName, iconColor: disease.iconColor, bgColor: disease.bgColor,
          imageUrl: disease.imageUrl, createdAt: disease.createdAt,
          startMonth: disease.startMonth, endMonth: disease.endMonth, peakMonth: disease.peakMonth,
          conditions: disease.conditions, conditionsEn: disease.conditionsEn,
          preventiveActions: disease.preventiveActions, preventiveActionsEn: disease.preventiveActionsEn,
          curativeActions: disease.curativeActions, curativeActionsEn: disease.curativeActionsEn,
          impactedParts: disease.impactedParts, impactedPartsEn: disease.impactedPartsEn,
          spreadMethod: disease.spreadMethod, spreadMethodEn: disease.spreadMethodEn,
          images: disease.images.map(i => ({ id: i.id, url: i.url, alt: i.alt, order: i.order })),
        },
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error("[API] Disease detail error:", error);
    return Response.json(
      { success: false, error: "Erreur serveur" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
