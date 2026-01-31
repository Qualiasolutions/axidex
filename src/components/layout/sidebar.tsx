"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";
import {
  LogOut,
  Loader2,
  LayoutDashboard,
  Radio,
  Mail,
  Building2,
  BarChart3,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Signals", href: "/dashboard/signals", icon: Radio },
  { name: "Scraping", href: "/dashboard/scraping", icon: RefreshCw },
  { name: "Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Accounts", href: "/dashboard/accounts", icon: Building2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Rules", href: "/dashboard/rules", icon: Workflow },
];

const bottomNavigation: NavItem[] = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const name = user.user_metadata?.full_name;
    if (name) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || "?";
  };

  const getUserDisplayName = () => {
    if (!user) return "Loading...";
    return user.user_metadata?.full_name || user.email || "User";
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r border-border/60",
        "transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-60",
        "hidden lg:flex"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-border/60",
        collapsed ? "justify-center" : "px-5"
      )}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 group",
            collapsed && "justify-center"
          )}
        >
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
            A
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              Axidex
            </span>
          )}
        </Link>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-50 flex items-center justify-center",
          "size-6 rounded-full bg-background border border-border/60 shadow-sm",
          "text-muted-foreground hover:text-foreground hover:border-border",
          "transition-all duration-200 hover:scale-110"
        )}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className={cn("space-y-1", collapsed ? "px-3" : "px-4")}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center p-3" : "px-4 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className={cn(
        "py-4 border-t border-border/60",
        collapsed ? "px-3" : "px-4"
      )}>
        <ul className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center p-3" : "px-4 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User section */}
      <div className={cn(
        "py-4 border-t border-border/60",
        collapsed ? "px-3" : "px-4"
      )}>
        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 mb-3",
          collapsed ? "justify-center" : "px-2"
        )}>
          <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 border border-primary/10">
            {getUserInitials()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {getUserDisplayName()}
              </p>
              {user?.email && user.user_metadata?.full_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
            collapsed ? "justify-center p-3" : "px-4 py-2.5",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            loggingOut && "opacity-50 cursor-not-allowed"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          {loggingOut ? (
            <Loader2 className="w-[18px] h-[18px] animate-spin" />
          ) : (
            <LogOut className="w-[18px] h-[18px]" />
          )}
          {!collapsed && (loggingOut ? "Signing out..." : "Sign out")}
        </button>
      </div>
    </motion.aside>
  );
}
