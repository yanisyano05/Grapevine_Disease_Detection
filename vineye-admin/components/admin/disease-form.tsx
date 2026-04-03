"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

interface DiseaseFormProps {
  initialData?: DiseaseInput & { id?: string; slug?: string };
  mode: "create" | "edit";
}

export default function DiseaseForm({ initialData, mode }: DiseaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initialData?.name ?? "");
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? "");
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
  const [iconName, setIconName] = useState(initialData?.iconName ?? "leaf");
  const [iconColor, setIconColor] = useState(initialData?.iconColor ?? "#1D9E75");
  const [bgColor, setBgColor] = useState(initialData?.bgColor ?? "#E1F5EE");
  const [published, setPublished] = useState(initialData?.published ?? true);

  function addSymptom(lang: "fr" | "en") {
    if (lang === "fr") setSymptoms([...symptoms, ""]);
    else setSymptomsEn([...symptomsEn, ""]);
  }

  function removeSymptom(lang: "fr" | "en", index: number) {
    if (lang === "fr") setSymptoms(symptoms.filter((_, i) => i !== index));
    else setSymptomsEn(symptomsEn.filter((_, i) => i !== index));
  }

  function updateSymptom(lang: "fr" | "en", index: number, value: string) {
    if (lang === "fr") {
      const next = [...symptoms];
      next[index] = value;
      setSymptoms(next);
    } else {
      const next = [...symptomsEn];
      next[index] = value;
      setSymptomsEn(next);
    }
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
      name: name.trim(),
      nameEn: nameEn.trim(),
      scientificName: scientificName.trim(),
      slug: slugify(name),
      type: type as DiseaseInput["type"],
      severity: severity as DiseaseInput["severity"],
      description: description.trim(),
      descriptionEn: descriptionEn.trim(),
      symptoms: filteredSymptoms,
      symptomsEn: symptomsEn.filter((s) => s.trim()),
      treatment: treatment.trim(),
      treatmentEn: treatmentEn.trim(),
      season: season.trim(),
      seasonEn: seasonEn.trim(),
      iconName,
      iconColor,
      bgColor,
      published,
    };

    try {
      const url =
        mode === "create"
          ? "/api/diseases"
          : `/api/diseases/${initialData?.id}`;
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

      toast.success(mode === "create" ? "Maladie creee" : "Maladie mise a jour");
      router.push("/diseases");
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
          {mode === "create" ? "Nouvelle maladie" : `Modifier — ${initialData?.name}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General info */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Informations generales
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nom (FR) *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nom (EN)</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Nom scientifique</Label>
              <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Classification
            </p>
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
                    <SelectItem value="HIGH">Critique</SelectItem>
                    <SelectItem value="MEDIUM">Modere</SelectItem>
                    <SelectItem value="LOW">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Description (FR) *</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Description (EN)</Label>
              <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Symptomes
            </p>
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">Symptomes (FR) *</Label>
              {symptoms.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s}
                    onChange={(e) => updateSymptom("fr", i, e.target.value)}
                    className="rounded-xl"
                    placeholder={`Symptome ${i + 1}`}
                  />
                  {symptoms.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeSymptom("fr", i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={() => addSymptom("fr")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
              </Button>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">Symptomes (EN)</Label>
              {symptomsEn.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s}
                    onChange={(e) => updateSymptom("en", i, e.target.value)}
                    className="rounded-xl"
                    placeholder={`Symptom ${i + 1}`}
                  />
                  {symptomsEn.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeSymptom("en", i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={() => addSymptom("en")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Treatment + Season */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Traitement & Saison
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Traitement (FR) *</Label>
              <Textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Traitement (EN)</Label>
              <Textarea value={treatmentEn} onChange={(e) => setTreatmentEn(e.target.value)} rows={2} className="rounded-xl" />
            </div>
            <Separator />
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

        {/* Appearance */}
        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Apparence
            </p>
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

        {/* Publish + Actions */}
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
          <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {mode === "create" ? "Creer" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
