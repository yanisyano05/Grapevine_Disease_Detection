"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteDialog from "@/components/admin/delete-dialog";
import { toast } from "sonner";
import { cn, formatDateShort } from "@/lib/utils";

type Alert = {
  id: string;
  title: string;
  type: string;
  region: string;
  active: boolean;
  activeFrom: Date;
  activeTo: Date | null;
  createdAt: Date;
};

const TYPE_STYLES: Record<string, string> = {
  WARNING: "bg-gold/10 text-gold border-gold/20",
  INFO: "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
  DANGER: "bg-wine/10 text-[#FB7185] border-wine/20",
};

export default function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = alerts.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.region.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggleActive(id: string, active: boolean) {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error();
      toast.success(active ? "Alerte activee" : "Alerte desactivee");
      router.refresh();
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Alerte supprimee");
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-cream">
            Alertes saisonnieres
          </h1>
          <p className="text-sm text-stone-600 mt-1">{alerts.length} alertes</p>
        </div>
        <Link
          href="/alerts/new"
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
          placeholder="Rechercher une alerte..."
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
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Region</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Periode</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Active</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((alert) => (
              <TableRow key={alert.id} className="border-[oklch(0.20_0.006_60)] hover:bg-[oklch(0.16_0.005_60)] transition-colors">
                <TableCell className="text-[13px] font-medium text-cream">{alert.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-[11px] font-medium border ${TYPE_STYLES[alert.type]}`}>
                    {alert.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px] text-stone-400 capitalize">{alert.region}</TableCell>
                <TableCell className="text-[12px] font-mono text-stone-600">
                  {formatDateShort(alert.activeFrom)}
                  {alert.activeTo && ` — ${formatDateShort(alert.activeTo)}`}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={alert.active}
                    onCheckedChange={(checked) => handleToggleActive(alert.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/alerts/${alert.id}/edit`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-stone-600 hover:text-cream")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteDialog
                      title="Supprimer cette alerte ?"
                      description={`L'alerte "${alert.title}" sera supprimee.`}
                      onConfirm={() => handleDelete(alert.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-sm text-stone-600 text-center py-10">Aucune alerte trouvee</p>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-4 hover:border-[oklch(0.28_0.006_60)] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium text-cream">{alert.title}</p>
              <Link
                href={`/alerts/${alert.id}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 shrink-0 text-stone-600")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[11px] font-medium border ${TYPE_STYLES[alert.type]}`}>
                {alert.type}
              </Badge>
              <span className="text-[11px] text-stone-600 capitalize">{alert.region}</span>
              <Switch
                checked={alert.active}
                onCheckedChange={(checked) => handleToggleActive(alert.id, checked)}
                className="ml-auto"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
