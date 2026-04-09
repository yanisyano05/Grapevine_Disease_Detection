"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bug,
  BookOpen,
  AlertTriangle,
  Users,
  LogOut,
  ChevronsLeft,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  userName?: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  {
    section: "Principal",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Contenu",
    items: [
      { label: "Maladies", href: "/diseases", icon: Bug },
      { label: "Guides", href: "/guides", icon: BookOpen },
      { label: "Alertes", href: "/alerts", icon: AlertTriangle },
    ],
  },
  {
    section: "Gestion",
    items: [
      { label: "Utilisateurs", href: "/users", icon: Users },
    ],
  },
];

export default function Sidebar({
  collapsed = false,
  onCollapse,
  userName = "Admin",
  userEmail = "admin@vineye.app",
}: SidebarProps) {
  const pathname = usePathname();

  function handleSignOut() {
    signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } });
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[oklch(0.11_0.005_60)] border-r border-[oklch(0.20_0.006_60)] transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-vine/10 flex items-center justify-center group-hover:bg-vine/15 transition-colors overflow-hidden">
                <Image src="/logo.png" alt="VinEye" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-cream">
                VinEye
              </span>
            </Link>
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-600 hover:text-cream hover:bg-[oklch(0.17_0.005_60)] transition-all duration-200"
              >
                <ChevronsLeft
                  className="h-4 w-4 transition-transform duration-300"
                  strokeWidth={1.5}
                />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onCollapse}
            className="mx-auto h-8 w-8 rounded-lg bg-vine/10 flex items-center justify-center hover:bg-vine/15 transition-colors overflow-hidden"
          >
            <ChevronsLeft
              className="h-4 w-4 text-vine rotate-180 transition-transform duration-300"
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[oklch(0.25_0.006_60)] to-transparent" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold/70">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-vine/8 text-vine"
                        : "text-stone-400 hover:text-cream hover:bg-[oklch(0.17_0.005_60)]",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-vine" />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive ? "text-vine" : "text-stone-600 group-hover:text-stone-400"
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[oklch(0.25_0.006_60)] to-transparent" />

      {/* User */}
      <div className={cn("p-3 shrink-0", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <Avatar className="h-8 w-8 ring-1 ring-[oklch(0.25_0.006_60)]">
              <AvatarFallback className="bg-vine/10 text-vine text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-cream truncate">{userName}</p>
              <p className="text-[11px] text-stone-600 truncate">{userEmail}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-600 hover:text-wine hover:bg-wine/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-600 hover:text-wine hover:bg-wine/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </aside>
  );
}
