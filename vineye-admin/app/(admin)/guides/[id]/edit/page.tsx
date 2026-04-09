import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuideForm from "@/components/admin/guide-form";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const guide = await prisma.guide.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!guide) notFound();

  return (
    <GuideForm
      mode="edit"
      initialData={{
        id: guide.id,
        title: guide.title,
        titleEn: guide.titleEn,
        subtitle: guide.subtitle,
        subtitleEn: guide.subtitleEn,
        content: guide.content,
        contentEn: guide.contentEn,
        category: guide.category,
        iconName: guide.iconName,
        iconColor: guide.iconColor,
        bgColor: guide.bgColor,
        published: guide.published,
        order: guide.order,
        readTime: guide.readTime,
        coverImage: guide.coverImage,
        sections: guide.sections.map((s) => ({
          title: s.title,
          titleEn: s.titleEn ?? "",
          body: s.body,
          bodyEn: s.bodyEn ?? "",
          image: s.image ?? "",
          tip: s.tip ?? "",
          tipEn: s.tipEn ?? "",
          order: s.order,
        })),
      }}
    />
  );
}
