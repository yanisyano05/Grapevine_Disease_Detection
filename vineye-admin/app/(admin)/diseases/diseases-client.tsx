"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import DeleteDialog from "@/components/admin/delete-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Disease = {
  id: string;
  name: string;
  scientificName: string;
  slug: string;
  type: string;
  severity: string;
  published: boolean;
  createdAt: Date;
  _count: { scans: number };
};

const TYPE_LABELS: Record<string, string> = {
  FUNGAL: "Fongique",
  BACTERIAL: "Bacterien",
  PEST: "Ravageur",
  ABIOTIC: "Carence",
};

const TYPE_STYLES: Record<string, string> = {
  FUNGAL: "bg-vine/10 text-vine border-vine/20",
  BACTERIAL: "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20",
  PEST: "bg-gold/10 text-gold border-gold/20",
  ABIOTIC: "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
};

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: "bg-wine/10 text-[#FB7185] border-wine/20",
  MEDIUM: "bg-gold/10 text-gold border-gold/20",
  LOW: "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
};

const SEVERITY_LABELS: Record<string, string> = {
  HIGH: "Critique",
  MEDIUM: "Modere",
  LOW: "Faible",
};

export default function DiseasesClient({ diseases }: { diseases: Disease[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = diseases.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  async function handleTogglePublish(id: string, published: boolean) {
    try {
      const res = await fetch(`/api/diseases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });

      if (!res.ok) throw new Error();
      toast.success(published ? "Maladie publiee" : "Maladie depubliee");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/diseases/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Maladie supprimee");
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-cream">
            Maladies de la vigne
          </h1>
          <p className="text-sm text-stone-600 mt-1">{diseases.length} maladies repertoriees</p>
        </div>
        <Link
          href="/diseases/new"
          className={cn(
            buttonVariants(),
            "rounded-xl bg-vine hover:bg-vine/90 text-[oklch(0.10_0.02_150)] font-semibold"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
          <Input
            placeholder="Rechercher une maladie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-[oklch(0.22_0.005_60)] text-cream placeholder:text-stone-700 focus:border-vine/40"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "FUNGAL", "BACTERIAL", "PEST", "ABIOTIC"].map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg text-xs font-medium transition-all",
                typeFilter === type
                  ? "bg-vine/10 text-vine border border-vine/20"
                  : "text-stone-600 border border-transparent hover:text-cream hover:bg-[oklch(0.18_0.005_60)]"
              )}
              onClick={() => setTypeFilter(type)}
            >
              {type === "ALL" ? "Tous" : TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[oklch(0.20_0.006_60)] hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Nom</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Severite</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Scans</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Publie</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((disease) => (
              <TableRow key={disease.id} className="border-[oklch(0.20_0.006_60)] hover:bg-[oklch(0.16_0.005_60)] transition-colors">
                <TableCell>
                  <div>
                    <p className="text-[13px] font-medium text-cream">{disease.name}</p>
                    {disease.scientificName && (
                      <p className="text-[11px] text-stone-600 italic">{disease.scientificName}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-[11px] font-medium border ${TYPE_STYLES[disease.type]}`}>
                    {TYPE_LABELS[disease.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-[11px] font-medium border ${SEVERITY_STYLES[disease.severity]}`}>
                    {SEVERITY_LABELS[disease.severity]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-[13px] font-mono text-stone-400">{disease._count.scans}</span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={disease.published}
                    onCheckedChange={(checked) => handleTogglePublish(disease.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/diseases/${disease.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-8 w-8 text-stone-600 hover:text-cream"
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteDialog
                      title="Supprimer cette maladie ?"
                      description={`La maladie "${disease.name}" sera supprimee definitivement.`}
                      onConfirm={() => handleDelete(disease.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-sm text-stone-600 text-center py-10">
            Aucune maladie trouvee
          </p>
        )}
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-3">
        {filtered.map((disease) => (
          <div key={disease.id} className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-4 hover:border-[oklch(0.28_0.006_60)] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[13px] font-medium text-cream">{disease.name}</p>
                {disease.scientificName && (
                  <p className="text-[11px] text-stone-600 italic">{disease.scientificName}</p>
                )}
              </div>
              <Link
                href={`/diseases/${disease.id}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-stone-600")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[11px] font-medium border ${TYPE_STYLES[disease.type]}`}>
                {TYPE_LABELS[disease.type]}
              </Badge>
              <Badge variant="secondary" className={`text-[11px] font-medium border ${SEVERITY_STYLES[disease.severity]}`}>
                {SEVERITY_LABELS[disease.severity]}
              </Badge>
              <span className="ml-auto text-[11px] font-mono text-stone-600">{disease._count.scans} scans</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
