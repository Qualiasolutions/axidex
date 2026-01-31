"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";
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
  Menu,
  X,
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

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 safe-area-inset-top">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
            A
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Axidex
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all duration-[var(--duration-fast)] touch-target active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 right-0 z-50 w-[280px] bg-background border-l border-border shadow-2xl safe-area-inset-right",
          "transform transition-transform duration-300 ease-[var(--ease-out-expo)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all duration-[var(--duration-fast)] active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hidden">
          <ul className="space-y-1 px-3">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl text-sm font-medium px-4 py-3 transition-all duration-[var(--duration-fast)] touch-target active:scale-[0.98]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    style={{ transitionDelay: isOpen ? `${index * 30}ms` : "0ms" }}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-4 mx-4 border-t border-border/60" />

          <ul className="space-y-1 px-3">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl text-sm font-medium px-4 py-3 transition-all duration-[var(--duration-fast)] touch-target active:scale-[0.98]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border/60 safe-area-inset-bottom">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-secondary/50">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 border border-primary/10">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.user_metadata?.full_name || user?.email || "Loading..."}
              </p>
              {user?.email && user.user_metadata?.full_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium px-4 py-3 transition-all duration-[var(--duration-fast)] touch-target active:scale-[0.98]",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border",
              loggingOut && "opacity-50 cursor-not-allowed"
            )}
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
