"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accentClass?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accentClass = "text-vine bg-vine/10",
}: StatCardProps) {
  return (
    <div className="group relative rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-5 transition-all duration-300 hover:border-[oklch(0.28_0.006_60)] hover:bg-[oklch(0.16_0.005_60)]">
      {/* Subtle gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vine/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-stone-600 uppercase tracking-[0.08em] mb-2">
            {title}
          </p>
          <p className="text-[28px] font-display font-semibold tracking-tight text-cream leading-none">
            {value.toLocaleString("fr-FR")}
          </p>
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accentClass}`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
