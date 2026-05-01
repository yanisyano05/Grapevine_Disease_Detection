"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ScanLine, Trophy, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface UserDetailProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    xp: number;
    level: number;
    banned: boolean;
    bannedReason: string | null;
    createdAt: Date;
    scans: {
      id: string;
      confidence: number;
      createdAt: Date;
      disease: { name: string; severity: string } | null;
    }[];
    _count: { scans: number };
  };
}

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: "bg-wine/10 text-[#FB7185] border-wine/20",
  MEDIUM: "bg-gold/10 text-gold border-gold/20",
  LOW: "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
};

export default function UserDetailClient({ user }: UserDetailProps) {
  const router = useRouter();
  const [reasonDraft, setReasonDraft] = useState(user.bannedReason ?? "");

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Utilisateur mis a jour");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
  }

  async function handleReasonBlur() {
    const trimmed = reasonDraft.trim();
    const current = user.bannedReason ?? "";
    if (trimmed === current) return;
    await handleUpdate({ bannedReason: trimmed.length > 0 ? trimmed : null });
  }

  const STAT_ITEMS = [
    { label: "Scans", value: user._count.scans, icon: ScanLine, color: "text-vine" },
    { label: "XP", value: user.xp, icon: Zap, color: "text-gold" },
    { label: "Niveau", value: user.level, icon: Trophy, color: "text-[#A78BFA]" },
    { label: "Inscrit", value: formatDate(user.createdAt, "MMM yyyy"), icon: Calendar, color: "text-[#60A5FA]" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-600 hover:text-cream"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-cream">
          Utilisateur
        </h1>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-[oklch(0.25_0.006_60)]">
            <AvatarFallback className="bg-vine/10 text-vine text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-lg font-semibold text-cream">{user.name}</h2>
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium border ${
                  user.role === "ADMIN"
                    ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20"
                    : "bg-[oklch(0.18_0.005_60)] text-stone-400 border-[oklch(0.25_0.006_60)]"
                }`}
              >
                {user.role}
              </Badge>
              {user.banned && (
                <Badge variant="secondary" className="text-[11px] font-medium bg-wine/10 text-[#FB7185] border border-wine/20">
                  Banni
                </Badge>
              )}
            </div>
            <p className="text-sm text-stone-400">{user.email}</p>
            <p className="text-[11px] text-stone-600 mt-1">
              Inscrit le {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {STAT_ITEMS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-[oklch(0.12_0.005_60)] p-3.5 text-center"
            >
              <stat.icon className={`h-4 w-4 mx-auto mb-1.5 ${stat.color}`} strokeWidth={1.5} />
              <p className="text-sm font-semibold text-cream font-mono">{stat.value}</p>
              <p className="text-[10px] text-stone-600 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin actions */}
      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-6 space-y-5">
        <p className="text-[11px] font-semibold text-gold/70 uppercase tracking-[0.1em]">
          Actions admin
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-cream">Role</p>
            <p className="text-[11px] text-stone-600">Modifier le role de l&apos;utilisateur</p>
          </div>
          <Select value={user.role} onValueChange={(role) => handleUpdate({ role })}>
            <SelectTrigger className="w-32 rounded-xl bg-[oklch(0.12_0.005_60)] border-[oklch(0.22_0.005_60)] text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-px bg-[oklch(0.20_0.006_60)]" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-cream">Bannir</p>
            <p className="text-[11px] text-stone-600">Empecher l&apos;acces a l&apos;application</p>
          </div>
          <Switch
            checked={user.banned}
            onCheckedChange={(banned) => handleUpdate({ banned })}
          />
        </div>
        {user.banned && (
          <div className="space-y-2">
            <Label htmlFor="bannedReason" className="text-[12px] text-stone-400">
              Raison du bannissement
            </Label>
            <Textarea
              id="bannedReason"
              value={reasonDraft}
              onChange={(e) => setReasonDraft(e.target.value)}
              onBlur={handleReasonBlur}
              placeholder="Visible par l&apos;utilisateur sur mobile"
              maxLength={500}
              rows={3}
              className="bg-[oklch(0.12_0.005_60)] border-[oklch(0.22_0.005_60)] text-cream"
            />
            <p className="text-[11px] text-stone-600">
              Affichee dans le mobile au prochain app boot. Maxi 500 caracteres.
            </p>
          </div>
        )}
      </div>

      {/* Scan history */}
      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[oklch(0.20_0.006_60)]">
          <h3 className="text-sm font-semibold text-cream">Historique des scans</h3>
        </div>
        <div className="divide-y divide-[oklch(0.20_0.006_60)]">
          {user.scans.length === 0 ? (
            <p className="text-sm text-stone-600 text-center py-8">Aucun scan</p>
          ) : (
            user.scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-[oklch(0.16_0.005_60)] transition-colors"
              >
                <div>
                  <p className="text-[13px] font-medium text-cream">{scan.disease?.name || "Non identifie"}</p>
                  <p className="text-[11px] text-stone-600">{formatDate(scan.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  {scan.disease?.severity && (
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-medium border ${SEVERITY_STYLES[scan.disease.severity]}`}
                    >
                      {scan.disease.severity}
                    </Badge>
                  )}
                  <span className="text-[12px] font-mono font-medium text-vine">
                    {Math.round(scan.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
