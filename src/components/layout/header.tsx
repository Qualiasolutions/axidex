"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ title, subtitle, breadcrumbs }: HeaderProps) {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] sticky top-0 lg:top-0 z-30">
      <div className="px-6 py-4 flex flex-col gap-1">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-secondary)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--text-tertiary)] truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Global search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search signals..."
                className="w-48 lg:w-56 h-9 pl-3 pr-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded">
                /
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
