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

type Guide = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: Date;
};

const CATEGORY_STYLES: Record<string, string> = {
  diagnostic: "bg-vine/10 text-vine border-vine/20",
  traitement: "bg-gold/10 text-gold border-gold/20",
  cepages: "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20",
  general: "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
};

export default function GuidesClient({ guides }: { guides: Guide[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Guide supprime");
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-cream">
            Guides
          </h1>
          <p className="text-sm text-stone-600 mt-1">{guides.length} guides</p>
        </div>
        <Link
          href="/guides/new"
          className={cn(
            buttonVariants(),
            "rounded-xl bg-vine hover:bg-vine/90 text-[oklch(0.10_0.02_150)] font-semibold"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
        <Input
          placeholder="Rechercher un guide..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-card border-[oklch(0.22_0.005_60)] text-cream placeholder:text-stone-700 focus:border-vine/40"
        />
      </div>

      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[oklch(0.20_0.006_60)] hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Titre</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Categorie</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Ordre</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Publie</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((guide) => (
              <TableRow key={guide.id} className="border-[oklch(0.20_0.006_60)] hover:bg-[oklch(0.16_0.005_60)] transition-colors">
                <TableCell>
                  <div>
                    <p className="text-[13px] font-medium text-cream">{guide.title}</p>
                    <p className="text-[11px] text-stone-600 truncate max-w-xs">{guide.subtitle}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[11px] font-medium border ${CATEGORY_STYLES[guide.category] || CATEGORY_STYLES.general}`}
                  >
                    {guide.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-[13px] font-mono text-stone-400">{guide.order}</span>
                </TableCell>
                <TableCell>
                  <Switch checked={guide.published} disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/guides/${guide.id}/edit`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-stone-600 hover:text-cream")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteDialog
                      title="Supprimer ce guide ?"
                      description={`Le guide "${guide.title}" sera supprime definitivement.`}
                      onConfirm={() => handleDelete(guide.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-sm text-stone-600 text-center py-10">Aucun guide trouve</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((guide) => (
          <div key={guide.id} className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-4 hover:border-[oklch(0.28_0.006_60)] transition-colors">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-cream">{guide.title}</p>
                <p className="text-[11px] text-stone-600 truncate">{guide.subtitle}</p>
              </div>
              <Link
                href={`/guides/${guide.id}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 shrink-0 text-stone-600")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium border ${CATEGORY_STYLES[guide.category] || CATEGORY_STYLES.general}`}
              >
                {guide.category}
              </Badge>
              <span className="text-[11px] font-mono text-stone-700">#{guide.order}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
