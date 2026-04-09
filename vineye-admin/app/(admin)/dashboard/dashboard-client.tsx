"use client";

import { Users, ScanLine, Bug, AlertTriangle } from "lucide-react";
import StatCard from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardProps {
  stats: {
    totalUsers: number;
    scansThisMonth: number;
    totalDiseases: number;
    activeAlerts: number;
  };
  recentScans: {
    id: string;
    userName: string;
    diseaseName: string;
    confidence: number;
    date: string;
  }[];
  topDiseases: { name: string; count: number }[];
}

export default function DashboardClient({ stats, recentScans, topDiseases }: DashboardProps) {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const maxCount = topDiseases[0]?.count || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-cream">
          Tableau de bord
        </h1>
        <p className="text-sm text-stone-600 mt-1 capitalize">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          accentClass="text-vine bg-vine/10"
        />
        <StatCard
          title="Scans ce mois"
          value={stats.scansThisMonth}
          icon={ScanLine}
          accentClass="text-[#60A5FA] bg-[#60A5FA]/10"
        />
        <StatCard
          title="Maladies"
          value={stats.totalDiseases}
          icon={Bug}
          accentClass="text-gold bg-gold/10"
        />
        <StatCard
          title="Alertes actives"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          accentClass="text-wine bg-wine/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent scans */}
        <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[oklch(0.20_0.006_60)]">
            <h2 className="text-sm font-semibold text-cream">Scans recents</h2>
          </div>
          <div className="divide-y divide-[oklch(0.20_0.006_60)]">
            {recentScans.length === 0 ? (
              <p className="text-sm text-stone-600 py-8 text-center">
                Aucun scan pour le moment
              </p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[oklch(0.16_0.005_60)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-cream truncate">{scan.diseaseName}</p>
                    <p className="text-[11px] text-stone-600">{scan.userName}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[12px] font-mono font-medium text-vine">
                      {scan.confidence}%
                    </span>
                    <span className="text-[11px] text-stone-700">{scan.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top diseases */}
        <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[oklch(0.20_0.006_60)]">
            <h2 className="text-sm font-semibold text-cream">Maladies les plus detectees</h2>
          </div>
          <div className="p-5 space-y-5">
            {topDiseases.length === 0 ? (
              <p className="text-sm text-stone-600 py-4 text-center">
                Pas assez de donnees
              </p>
            ) : (
              topDiseases.map((disease, i) => (
                <div key={disease.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-stone-700 w-4">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13px] font-medium text-cream">{disease.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-mono bg-vine/8 text-vine border-0 px-2">
                      {disease.count}
                    </Badge>
                  </div>
                  <div className="ml-6.5 h-1.5 bg-[oklch(0.18_0.005_60)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(disease.count / maxCount) * 100}%`,
                        background: `linear-gradient(90deg, oklch(0.72 0.19 150 / 0.7), oklch(0.72 0.19 150))`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
