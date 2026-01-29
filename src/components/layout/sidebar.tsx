"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Mail,
  Settings,
  Bell,
  Users,
  BarChart3,
  Target,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Signals", href: "/dashboard/signals", icon: Zap },
  { name: "Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Accounts", href: "/dashboard/accounts", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Rules", href: "/dashboard/rules", icon: Target },
];

const bottomNavigation = [
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden hidden" />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]",
          "transition-all duration-300 ease-out",
          collapsed ? "w-16" : "w-60",
          "hidden lg:flex"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-[var(--border-subtle)]",
          collapsed ? "justify-center px-0" : "justify-between px-5"
        )}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[var(--bg-primary)]" />
            </div>
            {!collapsed && (
              <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                PULSE
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                      isActive
                        ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && item.name}
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
          <ul className="space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                      isActive
                        ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && item.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                )}
                title={collapsed ? "Sign Out" : undefined}
              >
                <LogOut className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && "Sign Out"}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
