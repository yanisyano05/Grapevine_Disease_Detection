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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AlertFormProps {
  initialData?: {
    id?: string;
    title: string;
    titleEn: string;
    message: string;
    messageEn: string;
    type: string;
    region: string;
    active: boolean;
    activeFrom: string;
    activeTo: string;
  };
  mode: "create" | "edit";
}

export default function AlertForm({ initialData, mode }: AlertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [messageEn, setMessageEn] = useState(initialData?.messageEn ?? "");
  const [type, setType] = useState(initialData?.type ?? "WARNING");
  const [region, setRegion] = useState(initialData?.region ?? "bordeaux");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [activeFrom, setActiveFrom] = useState(initialData?.activeFrom ?? "");
  const [activeTo, setActiveTo] = useState(initialData?.activeTo ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || !message.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);

    const body = {
      title: title.trim(),
      titleEn: titleEn.trim(),
      message: message.trim(),
      messageEn: messageEn.trim(),
      type,
      region: region.trim(),
      active,
      activeFrom: activeFrom || undefined,
      activeTo: activeTo || null,
    };

    try {
      const url = mode === "create" ? "/api/alerts" : `/api/alerts/${initialData?.id}`;
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

      toast.success(mode === "create" ? "Alerte creee" : "Alerte mise a jour");
      router.push("/alerts");
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
          {mode === "create" ? "Nouvelle alerte" : `Modifier — ${initialData?.title}`}
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
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Message (FR) *</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Message (EN)</Label>
              <Textarea value={messageEn} onChange={(e) => setMessageEn(e.target.value)} rows={3} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="DANGER">Danger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Region</Label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date debut</Label>
                <Input type="date" value={activeFrom} onChange={(e) => setActiveFrom(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date fin</Label>
                <Input type="date" value={activeTo} onChange={(e) => setActiveTo(e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible dans l&apos;app mobile</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
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
