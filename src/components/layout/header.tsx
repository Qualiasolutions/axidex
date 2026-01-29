"use client";

import { Button } from "@/components/ui/button";
import { Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-tertiary)] truncate hidden sm:block">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 h-9 pl-9 pr-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Mobile search button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] rounded-full text-[9px] font-bold flex items-center justify-center text-[var(--bg-primary)]">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
