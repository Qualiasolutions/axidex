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
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, breadcrumbs, actions }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-xl sticky top-0 lg:top-0 z-30"
    >
      <div className="px-[var(--page-padding-x)] py-5 flex flex-col gap-2">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: easeOutExpo }}
            className="flex items-center gap-1.5 text-sm"
          >
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors duration-[var(--duration-fast)] font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-secondary)] font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: easeOutExpo }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-xl font-bold text-[var(--text-primary)] truncate tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--text-tertiary)] truncate mt-1">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            className="flex items-center gap-3"
          >
            {actions}
            {/* Global search */}
            <div className="relative hidden md:block group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent)] transition-colors duration-[var(--duration-fast)]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search signals..."
                className="w-52 lg:w-64 h-10 pl-10 pr-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] input-premium"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md">
                /
              </kbd>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
