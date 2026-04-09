"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  level: number;
  banned: boolean;
  createdAt: Date;
  _count: { scans: number };
};

export default function UsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-cream">
          Utilisateurs
        </h1>
        <p className="text-sm text-stone-600 mt-1">{users.length} utilisateurs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-[oklch(0.22_0.005_60)] text-cream placeholder:text-stone-700 focus:border-vine/40"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "USER", "ADMIN"].map((role) => (
            <Button
              key={role}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg text-xs font-medium transition-all",
                roleFilter === role
                  ? "bg-vine/10 text-vine border border-vine/20"
                  : "text-stone-600 border border-transparent hover:text-cream hover:bg-[oklch(0.18_0.005_60)]"
              )}
              onClick={() => setRoleFilter(role)}
            >
              {role === "ALL" ? "Tous" : role}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[oklch(0.20_0.006_60)] hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Utilisateur</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">XP</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Niveau</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Scans</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Inscrit</TableHead>
              <TableHead className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="border-[oklch(0.20_0.006_60)] hover:bg-[oklch(0.16_0.005_60)] transition-colors">
                <TableCell>
                  <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                    <Avatar className="h-8 w-8 ring-1 ring-[oklch(0.25_0.006_60)] group-hover:ring-vine/30 transition-all">
                      <AvatarFallback className="bg-vine/10 text-vine text-[11px] font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-medium text-cream group-hover:text-vine transition-colors">{user.name}</p>
                      <p className="text-[11px] text-stone-600">{user.email}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="text-[13px] font-mono text-stone-400">{user.xp}</TableCell>
                <TableCell className="text-[13px] font-mono text-stone-400">{user.level}</TableCell>
                <TableCell className="text-[13px] font-mono text-stone-400">{user._count.scans}</TableCell>
                <TableCell className="text-[12px] font-mono text-stone-600">{formatDateShort(user.createdAt)}</TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="secondary" className="text-[11px] font-medium bg-wine/10 text-[#FB7185] border border-wine/20">
                      Banni
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-vine">
                      <span className="h-1.5 w-1.5 rounded-full bg-vine animate-vine-pulse" />
                      Actif
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-sm text-stone-600 text-center py-10">Aucun utilisateur trouve</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((user) => (
          <Link key={user.id} href={`/users/${user.id}`}>
            <div className="rounded-xl border border-[oklch(0.22_0.006_60)] bg-card p-4 mb-3 hover:border-[oklch(0.28_0.006_60)] transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-[oklch(0.25_0.006_60)]">
                  <AvatarFallback className="bg-vine/10 text-vine text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-cream truncate">{user.name}</p>
                  <p className="text-[11px] text-stone-600 truncate">{user.email}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[11px] font-medium shrink-0 border ${
                    user.role === "ADMIN"
                      ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20"
                      : "bg-[oklch(0.18_0.005_60)] text-stone-400 border-[oklch(0.25_0.006_60)]"
                  }`}
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
