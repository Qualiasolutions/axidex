"use client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
          <span className="text-sm">Menu</span>
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
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-56 h-9 pl-3 pr-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <span className="text-sm">3</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
