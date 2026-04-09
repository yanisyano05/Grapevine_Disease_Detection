"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, X, Loader2, ChevronUp, ChevronDown,
  Lightbulb, ImagePlus, BookOpen, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface GuideSection {
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  image: string;
  tip: string;
  tipEn: string;
  order: number;
}

interface GuideFormData {
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
  readTime: number | null;
  coverImage: string | null;
  sections: GuideSection[];
}

interface GuideFormProps {
  initialData?: GuideFormData;
  mode: "create" | "edit";
}

const EMPTY_SECTION: GuideSection = {
  title: "", titleEn: "", body: "", bodyEn: "",
  image: "", tip: "", tipEn: "", order: 0,
};

export default function GuideForm({ initialData, mode }: GuideFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugCustom, setSlugCustom] = useState(!!initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? "");
  const [slug, setSlug] = useState(initialData?.id ? "" : "");
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
  const [readTime, setReadTime] = useState<number | null>(initialData?.readTime ?? null);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [sections, setSections] = useState<GuideSection[]>(
    initialData?.sections ?? [],
  );

  const handleTitleChange = useCallback((v: string) => {
    setTitle(v);
    if (!slugCustom) setSlug(slugify(v));
  }, [slugCustom]);

  // Section helpers
  function addSection() {
    setSections((prev) => [...prev, { ...EMPTY_SECTION, order: prev.length }]);
  }
  function removeSection(i: number) {
    setSections((prev) =>
      prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })),
    );
  }
  function moveSection(i: number, dir: -1 | 1) {
    setSections((prev) => {
      const n = [...prev];
      const t = i + dir;
      if (t < 0 || t >= n.length) return n;
      [n[i], n[t]] = [n[t], n[i]];
      return n.map((s, idx) => ({ ...s, order: idx }));
    });
  }
  function updateSection(i: number, field: keyof GuideSection, value: string | number) {
    setSections((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [field]: value };
      return n;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || !subtitle.trim()) {
      toast.error("Veuillez remplir le titre et le sous-titre");
      return;
    }

    setLoading(true);

    const body = {
      title: title.trim(), titleEn: titleEn.trim(),
      slug: slug || slugify(title),
      subtitle: subtitle.trim(), subtitleEn: subtitleEn.trim(),
      content: content.trim(), contentEn: contentEn.trim(),
      category, iconName, iconColor, bgColor, published, order,
      readTime, coverImage: coverImage.trim() || null,
      sections: sections
        .filter((s) => s.title.trim() && s.body.trim())
        .map((s, i) => ({
          title: s.title.trim(), titleEn: s.titleEn.trim(),
          body: s.body.trim(), bodyEn: s.bodyEn.trim(),
          image: s.image.trim() || null,
          tip: s.tip.trim() || null, tipEn: s.tipEn.trim() || null,
          order: i,
        })),
    };

    try {
      const url = mode === "create" ? "/api/guides" : `/api/guides/${initialData?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Erreur");
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Nouveau guide" : `Modifier — ${initialData?.title}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── General info ── */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informations generales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Titre (FR) *</Label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} className="rounded-xl" required />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Slug</Label>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{slugCustom ? "custom" : "auto"}</Badge>
                </div>
                <Input value={slug} onChange={(e) => { setSlugCustom(true); setSlug(e.target.value); }} className="rounded-xl font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Categorie</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="traitement">Traitement</SelectItem>
                    <SelectItem value="cepages">Cepages</SelectItem>
                    <SelectItem value="prevention">Prevention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Ordre d&apos;affichage</Label>
                <Input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} className="rounded-xl" min={0} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-xs font-medium text-muted-foreground">Temps de lecture (min)</Label>
                </div>
                <Input
                  type="number"
                  value={readTime ?? ""}
                  onChange={(e) => setReadTime(e.target.value ? parseInt(e.target.value) : null)}
                  className="rounded-xl"
                  min={1}
                  placeholder="5"
                />
              </div>
            </div>
            {/* Cover image */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground">Image de couverture (URL)</Label>
              </div>
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="rounded-xl" placeholder="https://..." />
              {coverImage && (
                <div className="rounded-xl overflow-hidden border border-dashed border-border h-32 mt-2">
                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Legacy content (collapsible) ── */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <Accordion>
              <AccordionItem value="legacy" className="border-0">
                <AccordionTrigger className="text-sm font-medium py-0 hover:no-underline">
                  <span className="flex items-center gap-2">
                    Contenu brut
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-0">Ancien format</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Ce champ est conserve pour compatibilite. Utilisez les sections ci-dessous pour le contenu structure.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Contenu (FR)</Label>
                      <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Contenu (EN)</Label>
                      <Textarea value={contentEn} onChange={(e) => setContentEn(e.target.value)} rows={4} className="rounded-xl" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* ── Sections ── */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections du guide</p>
              </div>
              <Badge variant="secondary" className="text-xs">{sections.length} section{sections.length !== 1 ? "s" : ""}</Badge>
            </div>

            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Aucune section</p>
                <p className="text-xs text-muted-foreground mb-4">Ajoutez la premiere section de votre guide.</p>
                <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={addSection}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter la premiere section
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, i) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Section {i + 1}</p>
                      <div className="flex items-center gap-1">
                        {i > 0 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(i, -1)}>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {i < sections.length - 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(i, 1)}>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeSection(i)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Titre (FR) *</Label>
                        <Input value={section.title} onChange={(e) => updateSection(i, "title", e.target.value)} className="rounded-lg h-9 text-sm" placeholder="Titre de la section" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Titre (EN)</Label>
                        <Input value={section.titleEn} onChange={(e) => updateSection(i, "titleEn", e.target.value)} className="rounded-lg h-9 text-sm" placeholder="Section title" />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Contenu (FR) *</Label>
                        <Textarea value={section.body} onChange={(e) => updateSection(i, "body", e.target.value)} rows={4} className="rounded-lg text-sm" placeholder="Contenu de la section..." />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Contenu (EN)</Label>
                        <Textarea value={section.bodyEn} onChange={(e) => updateSection(i, "bodyEn", e.target.value)} rows={4} className="rounded-lg text-sm" placeholder="Section content..." />
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="h-3 w-3 text-amber-500" />
                          <Label className="text-[11px] font-medium text-muted-foreground">Astuce (FR)</Label>
                        </div>
                        <Input value={section.tip} onChange={(e) => updateSection(i, "tip", e.target.value)} className="rounded-lg h-9 text-sm" placeholder="Conseil pratique..." />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-muted-foreground">Astuce (EN)</Label>
                        <Input value={section.tipEn} onChange={(e) => updateSection(i, "tipEn", e.target.value)} className="rounded-lg h-9 text-sm" placeholder="Practical tip..." />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <ImagePlus className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-[11px] font-medium text-muted-foreground">Image (URL)</Label>
                      </div>
                      <Input value={section.image} onChange={(e) => updateSection(i, "image", e.target.value)} className="rounded-lg h-9 text-sm" placeholder="https://..." />
                      {section.image && (
                        <div className="rounded-lg overflow-hidden border border-dashed border-border h-24 mt-1">
                          <img src={section.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="secondary" size="sm" className="rounded-lg w-full" onClick={addSection}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une section
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Appearance ── */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apparence</p>
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

        {/* ── Publish ── */}
        <Card className="border-border/50">
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
