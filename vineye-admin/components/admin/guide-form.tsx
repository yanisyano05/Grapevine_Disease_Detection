"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface GuideFormProps {
  initialData?: {
    id?: string;
    title: string;
    titleEn: string;
    subtitle: string;
    subtitleEn: string;
    content: string;
    contentEn: string;
    category: string;
    iconName: string;
    iconColor: string;
    bgColor: string;
    published: boolean;
    order: number;
  };
  mode: "create" | "edit";
}

export default function GuideForm({ initialData, mode }: GuideFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [subtitleEn, setSubtitleEn] = useState(initialData?.subtitleEn ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [contentEn, setContentEn] = useState(initialData?.contentEn ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "general");
  const [iconName, setIconName] = useState(initialData?.iconName ?? "book");
  const [iconColor, setIconColor] = useState(initialData?.iconColor ?? "#185FA5");
  const [bgColor, setBgColor] = useState(initialData?.bgColor ?? "#E6F1FB");
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [order, setOrder] = useState(initialData?.order ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || !subtitle.trim() || !content.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);

    const body = {
      title: title.trim(),
      titleEn: titleEn.trim(),
      slug: slugify(title),
      subtitle: subtitle.trim(),
      subtitleEn: subtitleEn.trim(),
      content: content.trim(),
      contentEn: contentEn.trim(),
      category,
      iconName,
      iconColor,
      bgColor,
      published,
      order,
    };

    try {
      const url = mode === "create" ? "/api/guides" : `/api/guides/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur");
        return;
      }

      toast.success(mode === "create" ? "Guide cree" : "Guide mis a jour");
      router.push("/guides");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Nouveau guide" : `Modifier — ${initialData?.title}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Informations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Titre (FR) *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Titre (EN)</Label>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Sous-titre (FR) *</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Sous-titre (EN)</Label>
                <Input value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Categorie</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Ordre</Label>
                <Input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} className="rounded-xl" min={0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contenu</p>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Contenu (FR) *</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Contenu (EN)</Label>
              <Textarea value={contentEn} onChange={(e) => setContentEn(e.target.value)} rows={6} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apparence</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Icone</Label>
                <Input value={iconName} onChange={(e) => setIconName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Couleur icone</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="h-9 w-9 rounded-lg border border-input cursor-pointer" />
                  <Input value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Couleur fond</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 rounded-lg border border-input cursor-pointer" />
                  <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Publier</p>
                <p className="text-xs text-muted-foreground">Visible dans l&apos;app mobile</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl">Annuler</Button>
          <Button type="submit" disabled={loading} className="rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {mode === "create" ? "Creer" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
