"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Signals", href: "/dashboard/signals" },
  { name: "Emails", href: "/dashboard/emails" },
  { name: "Accounts", href: "/dashboard/accounts" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Rules", href: "/dashboard/rules" },
];

const bottomNavigation = [
  { name: "Notifications", href: "/dashboard/notifications" },
  { name: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--bg-primary)] border-r border-[var(--border-subtle)]",
        "transition-all duration-200",
        collapsed ? "w-16" : "w-56",
        "hidden lg:flex"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-14 flex items-center border-b border-[var(--border-subtle)]",
        collapsed ? "justify-center" : "px-5"
      )}>
        <Link href="/" className="text-base font-semibold tracking-tight text-[var(--accent)]">
          {collapsed ? "A" : "Axidex"}
        </Link>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "mx-3 mt-3 p-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded transition-colors",
          collapsed && "mx-auto"
        )}
      >
        {collapsed ? "→" : "←"}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center p-2.5" : "px-3 py-2",
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {collapsed ? item.name[0] : item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className={cn(
        "py-4 border-t border-[var(--border-subtle)]",
        collapsed ? "px-2" : "px-3"
      )}>
        <ul className="space-y-0.5">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center p-2.5" : "px-3 py-2",
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {collapsed ? item.name[0] : item.name}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              className={cn(
                "w-full flex items-center rounded-lg text-sm transition-colors",
                collapsed ? "justify-center p-2.5" : "px-3 py-2",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              {collapsed ? "×" : "Sign Out"}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
