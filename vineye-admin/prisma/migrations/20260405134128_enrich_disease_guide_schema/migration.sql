-- AlterTable
ALTER TABLE "diseases" ADD COLUMN     "conditions" TEXT[],
ADD COLUMN     "conditionsEn" TEXT[],
ADD COLUMN     "curativeActions" TEXT[],
ADD COLUMN     "curativeActionsEn" TEXT[],
ADD COLUMN     "endMonth" INTEGER,
ADD COLUMN     "impactedParts" TEXT[],
ADD COLUMN     "impactedPartsEn" TEXT[],
ADD COLUMN     "peakMonth" INTEGER,
ADD COLUMN     "preventiveActions" TEXT[],
ADD COLUMN     "preventiveActionsEn" TEXT[],
ADD COLUMN     "spreadMethod" TEXT,
ADD COLUMN     "spreadMethodEn" TEXT,
ADD COLUMN     "startMonth" INTEGER;

-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "readTime" INTEGER;

-- CreateTable
CREATE TABLE "disease_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "diseaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disease_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "body" TEXT NOT NULL,
    "bodyEn" TEXT,
    "image" TEXT,
    "tip" TEXT,
    "tipEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "guideId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disease_images_diseaseId_idx" ON "disease_images"("diseaseId");

-- CreateIndex
CREATE INDEX "guide_sections_guideId_idx" ON "guide_sections"("guideId");

-- AddForeignKey
ALTER TABLE "disease_images" ADD CONSTRAINT "disease_images_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "diseases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_sections" ADD CONSTRAINT "guide_sections_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
