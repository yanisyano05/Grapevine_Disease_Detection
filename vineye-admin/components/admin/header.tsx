"use client";

import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

interface HeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

export default function Header({ onMenuClick, userName = "Admin" }: HeaderProps) {
  function handleSignOut() {
    signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } });
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-[oklch(0.20_0.006_60)] bg-[oklch(0.11_0.005_60_/_0.8)] backdrop-blur-xl shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 text-stone-400 hover:text-cream"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search hint (desktop) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[oklch(0.22_0.005_60)] bg-[oklch(0.14_0.005_60)] text-stone-600 text-xs cursor-pointer hover:border-stone-700 transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span>Rechercher...</span>
        <kbd className="ml-4 px-1.5 py-0.5 rounded bg-[oklch(0.18_0.005_60)] border border-[oklch(0.25_0.006_60)] text-[10px] font-mono text-stone-600">
          Ctrl K
        </kbd>
      </div>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-stone-600 hover:text-cream hover:bg-[oklch(0.17_0.005_60)]"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-vine animate-vine-pulse" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 w-9 rounded-lg p-0 inline-flex items-center justify-center hover:bg-[oklch(0.17_0.005_60)] transition-colors">
            <Avatar className="h-7 w-7 ring-1 ring-[oklch(0.25_0.006_60)]">
              <AvatarFallback className="bg-vine/10 text-vine text-[11px] font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-sm text-muted-foreground">{userName}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-sm text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              Se deconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
