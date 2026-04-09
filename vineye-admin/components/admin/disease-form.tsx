"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, X, Loader2, Calendar, Shield, Syringe,
  Bug, Leaf, ImagePlus, ChevronUp, ChevronDown, AlertTriangle,
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
import type { DiseaseInput } from "@/lib/validations";

interface DiseaseImage {
  url: string;
  alt: string;
  order: number;
}

interface DiseaseFormProps {
  initialData?: Partial<DiseaseInput> & { id?: string; slug?: string; images?: DiseaseImage[] };
  mode: "create" | "edit";
}

const MONTHS = [
  { value: 1, label: "Janvier" }, { value: 2, label: "Fevrier" }, { value: 3, label: "Mars" },
  { value: 4, label: "Avril" }, { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" }, { value: 8, label: "Aout" }, { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" }, { value: 11, label: "Novembre" }, { value: 12, label: "Decembre" },
];
const MONTH_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const IMPACTED_PARTS_OPTIONS = ["Feuilles", "Grappes", "Rameaux", "Tronc", "Racines", "Vrilles"];

export default function DiseaseForm({ initialData, mode }: DiseaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugCustom, setSlugCustom] = useState(!!initialData?.slug);

  const [name, setName] = useState(initialData?.name ?? "");
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [scientificName, setScientificName] = useState(initialData?.scientificName ?? "");
  const [type, setType] = useState(initialData?.type ?? "FUNGAL");
  const [severity, setSeverity] = useState(initialData?.severity ?? "MEDIUM");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? "");
  const [symptoms, setSymptoms] = useState<string[]>(initialData?.symptoms ?? [""]);
  const [symptomsEn, setSymptomsEn] = useState<string[]>(initialData?.symptomsEn ?? [""]);
  const [treatment, setTreatment] = useState(initialData?.treatment ?? "");
  const [treatmentEn, setTreatmentEn] = useState(initialData?.treatmentEn ?? "");
  const [season, setSeason] = useState(initialData?.season ?? "");
  const [seasonEn, setSeasonEn] = useState(initialData?.seasonEn ?? "");
  const [startMonth, setStartMonth] = useState<number | null>(initialData?.startMonth ?? null);
  const [endMonth, setEndMonth] = useState<number | null>(initialData?.endMonth ?? null);
  const [peakMonth, setPeakMonth] = useState<number | null>(initialData?.peakMonth ?? null);
  const [conditions, setConditions] = useState<string[]>(initialData?.conditions ?? []);
  const [conditionsEn, setConditionsEn] = useState<string[]>(initialData?.conditionsEn ?? []);
  const [preventiveActions, setPreventiveActions] = useState<string[]>(initialData?.preventiveActions ?? []);
  const [preventiveActionsEn, setPreventiveActionsEn] = useState<string[]>(initialData?.preventiveActionsEn ?? []);
  const [curativeActions, setCurativeActions] = useState<string[]>(initialData?.curativeActions ?? []);
  const [curativeActionsEn, setCurativeActionsEn] = useState<string[]>(initialData?.curativeActionsEn ?? []);
  const [impactedParts, setImpactedParts] = useState<string[]>(initialData?.impactedParts ?? []);
  const [spreadMethod, setSpreadMethod] = useState(initialData?.spreadMethod ?? "");
  const [spreadMethodEn, setSpreadMethodEn] = useState(initialData?.spreadMethodEn ?? "");
  const [iconName, setIconName] = useState(initialData?.iconName ?? "leaf");
  const [iconColor, setIconColor] = useState(initialData?.iconColor ?? "#1D9E75");
  const [bgColor, setBgColor] = useState(initialData?.bgColor ?? "#E1F5EE");
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [images, setImages] = useState<DiseaseImage[]>(initialData?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const handleNameChange = useCallback((v: string) => {
    setName(v);
    if (!slugCustom) setSlug(slugify(v));
  }, [slugCustom]);

  function addItem(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => [...prev, ""]);
  }
  function removeItem(setter: React.Dispatch<React.SetStateAction<string[]>>, i: number) {
    setter((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, v: string) {
    setter((prev) => { const n = [...prev]; n[i] = v; return n; });
  }

  function addImage() {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, { url: newImageUrl.trim(), alt: newImageAlt.trim(), order: prev.length }]);
    setNewImageUrl("");
    setNewImageAlt("");
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, order: idx })));
  }
  function moveImage(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const n = [...prev];
      const t = i + dir;
      if (t < 0 || t >= n.length) return n;
      [n[i], n[t]] = [n[t], n[i]];
      return n.map((img, idx) => ({ ...img, order: idx }));
    });
  }

  function togglePart(part: string) {
    setImpactedParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  }

  function isMonthActive(m: number) {
    if (!startMonth || !endMonth) return false;
    if (startMonth <= endMonth) return m >= startMonth && m <= endMonth;
    return m >= startMonth || m <= endMonth;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!name.trim() || !description.trim() || !treatment.trim() || !season.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const filteredSymptoms = symptoms.filter((s) => s.trim());
    if (filteredSymptoms.length === 0) {
      toast.error("Ajoutez au moins un symptome");
      return;
    }

    setLoading(true);
    const body: DiseaseInput = {
      name: name.trim(), nameEn: nameEn.trim(), scientificName: scientificName.trim(),
      slug: slug || slugify(name),
      type: type as DiseaseInput["type"], severity: severity as DiseaseInput["severity"],
      description: description.trim(), descriptionEn: descriptionEn.trim(),
      symptoms: filteredSymptoms, symptomsEn: symptomsEn.filter((s) => s.trim()),
      treatment: treatment.trim(), treatmentEn: treatmentEn.trim(),
      season: season.trim(), seasonEn: seasonEn.trim(),
      iconName, iconColor, bgColor, published,
      startMonth, endMonth, peakMonth,
      conditions: conditions.filter((s) => s.trim()), conditionsEn: conditionsEn.filter((s) => s.trim()),
      preventiveActions: preventiveActions.filter((s) => s.trim()), preventiveActionsEn: preventiveActionsEn.filter((s) => s.trim()),
      curativeActions: curativeActions.filter((s) => s.trim()), curativeActionsEn: curativeActionsEn.filter((s) => s.trim()),
      impactedParts, impactedPartsEn: [],
      spreadMethod: spreadMethod.trim() || null, spreadMethodEn: spreadMethodEn.trim() || null,
      images,
    };

    try {
      const url = mode === "create" ? "/api/diseases" : `/api/diseases/${initialData?.id}`;
      const res = await fetch(url, { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Erreur"); return; }
      toast.success(mode === "create" ? "Maladie creee" : "Maladie mise a jour");
      router.push("/diseases");
      router.refresh();
    } catch { toast.error("Une erreur est survenue"); } finally { setLoading(false); }
  }

  function StringListEditor({ label, items, setItems, placeholder }: {
    label: string; items: string[]; setItems: React.Dispatch<React.SetStateAction<string[]>>; placeholder: string;
  }) {
    return (
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {items.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Input value={s} onChange={(e) => updateItem(setItems, i, e.target.value)} className="rounded-xl" placeholder={placeholder} />
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeItem(setItems, i)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={() => addItem(setItems)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Nouvelle maladie" : `Modifier — ${initialData?.name}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informations generales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nom (FR) *</Label>
                <Input value={name} onChange={(e) => handleNameChange(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nom (EN)</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="rounded-xl" />
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
                <Label className="text-xs font-medium text-muted-foreground">Nom scientifique</Label>
                <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} className="rounded-xl italic" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Type *</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FUNGAL">Fongique</SelectItem>
                    <SelectItem value="BACTERIAL">Bacterien</SelectItem>
                    <SelectItem value="PEST">Ravageur</SelectItem>
                    <SelectItem value="ABIOTIC">Carence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Severite *</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Critique</span></SelectItem>
                    <SelectItem value="MEDIUM"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Modere</span></SelectItem>
                    <SelectItem value="LOW"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Faible</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Description (FR) *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Description (EN)</Label>
                <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms & Treatment */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symptomes & Traitement</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StringListEditor label="Symptomes (FR) *" items={symptoms} setItems={setSymptoms} placeholder="Symptome..." />
              <StringListEditor label="Symptomes (EN)" items={symptomsEn} setItems={setSymptomsEn} placeholder="Symptom..." />
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Traitement (FR) *</Label>
                <Textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Traitement (EN)</Label>
                <Textarea value={treatmentEn} onChange={(e) => setTreatmentEn(e.target.value)} rows={2} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Saison (FR) *</Label>
                <Input value={season} onChange={(e) => setSeason(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Saison (EN)</Label>
                <Input value={seasonEn} onChange={(e) => setSeasonEn(e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline saisonniere</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([["Debut", startMonth, setStartMonth], ["Pic", peakMonth, setPeakMonth], ["Fin", endMonth, setEndMonth]] as const).map(([label, val, setter]) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
                  <Select value={val?.toString() ?? ""} onValueChange={(v) => (setter as (v: number | null) => void)(v ? parseInt(v) : null)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Mois" /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m) => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden h-7">
              {MONTH_SHORT.map((label, i) => {
                const m = i + 1;
                const active = isMonthActive(m);
                const isPeak = m === peakMonth;
                return (
                  <div key={i} className={`flex-1 flex items-center justify-center text-[10px] font-medium transition-colors ${isPeak ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {label}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Details accordion */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details techniques</p>
            <Accordion multiple className="space-y-2">
              <AccordionItem value="conditions" className="border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium py-3">
                  <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Conditions favorables</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <StringListEditor label="FR" items={conditions} setItems={setConditions} placeholder="Ex: Humidite > 80%" />
                  <div className="mt-3"><StringListEditor label="EN" items={conditionsEn} setItems={setConditionsEn} placeholder="Ex: Humidity > 80%" /></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="preventive" className="border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium py-3">
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Actions preventives</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <StringListEditor label="FR" items={preventiveActions} setItems={setPreventiveActions} placeholder="Ex: Traitement au cuivre" />
                  <div className="mt-3"><StringListEditor label="EN" items={preventiveActionsEn} setItems={setPreventiveActionsEn} placeholder="Ex: Copper treatment" /></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="curative" className="border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium py-3">
                  <span className="flex items-center gap-2"><Syringe className="h-4 w-4 text-amber-600" /> Actions curatives</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <StringListEditor label="FR" items={curativeActions} setItems={setCurativeActions} placeholder="Ex: Fongicide systemique" />
                  <div className="mt-3"><StringListEditor label="EN" items={curativeActionsEn} setItems={setCurativeActionsEn} placeholder="Ex: Systemic fungicide" /></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="parts" className="border rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium py-3">
                  <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" /> Parties impactees</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex flex-wrap gap-2">
                    {IMPACTED_PARTS_OPTIONS.map((part) => (
                      <button key={part} type="button" onClick={() => togglePart(part)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${impactedParts.includes(part) ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-transparent hover:border-border"}`}>
                        {part}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Bug className="h-4 w-4 text-red-500" /><Label className="text-xs font-medium text-muted-foreground">Propagation (FR)</Label></div>
                <Input value={spreadMethod} onChange={(e) => setSpreadMethod(e.target.value)} className="rounded-xl" placeholder="Ex: Spores par le vent" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Propagation (EN)</Label>
                <Input value={spreadMethodEn} onChange={(e) => setSpreadMethodEn(e.target.value)} className="rounded-xl" placeholder="Ex: Spores by wind" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Images</p></div>
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-border/50">
                    <img src={img.url} alt={img.alt} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {i > 0 && <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveImage(i, -1)}><ChevronUp className="h-3.5 w-3.5" /></Button>}
                      {i < images.length - 1 && <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveImage(i, 1)}><ChevronDown className="h-3.5 w-3.5" /></Button>}
                      <Button type="button" size="icon" variant="destructive" className="h-7 w-7" onClick={() => removeImage(i)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate px-2 py-1">{img.alt || "Sans description"}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="rounded-xl flex-1" placeholder="URL de l'image" />
              <Input value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} className="rounded-xl w-40" placeholder="Alt text" />
              <Button type="button" variant="secondary" size="sm" className="rounded-lg shrink-0" onClick={addImage} disabled={!newImageUrl.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
              </Button>
            </div>
            {newImageUrl && (
              <div className="rounded-xl overflow-hidden border border-dashed border-border h-32">
                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
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

        {/* Publish */}
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
