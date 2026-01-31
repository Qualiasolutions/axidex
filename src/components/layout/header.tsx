"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { motion } from "motion/react";
import type { Easing } from "motion/react";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

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
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 lg:top-0 z-30"
    >
      <div className="px-6 lg:px-8 py-5 flex flex-col gap-1.5">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-secondary)] font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[var(--text-primary)] truncate tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--text-tertiary)] truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Global search */}
            <div className="relative hidden md:block group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent)] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search signals..."
                className="w-52 lg:w-64 h-10 pl-10 pr-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md">
                /
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
