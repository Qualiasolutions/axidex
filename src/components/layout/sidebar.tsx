"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Signals", href: "/dashboard/signals" },
  { name: "Emails", href: "/dashboard/emails" },
  { name: "Accounts", href: "/dashboard/accounts" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Rules", href: "/dashboard/rules" },
];

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings" },
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
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r border-border",
        "transition-all duration-200",
        collapsed ? "w-16" : "w-56",
        "hidden lg:flex"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-14 flex items-center border-b border-border",
        collapsed ? "justify-center" : "px-5"
      )}>
        <Link href="/" className="text-base font-semibold tracking-tight text-primary">
          {collapsed ? "A" : "Axidex"}
        </Link>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "mx-3 mt-3 p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors",
          collapsed && "mx-auto"
        )}
      >
        {collapsed ? ">" : "<"}
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
        "py-4 border-t border-border",
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {collapsed ? item.name[0] : item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User section */}
      <div className={cn(
        "py-4 border-t border-border",
        collapsed ? "px-2" : "px-3"
      )}>
        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 mb-3",
          collapsed ? "justify-center" : "px-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
            {getUserInitials()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
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
            "w-full flex items-center gap-2 rounded-lg text-sm transition-colors",
            collapsed ? "justify-center p-2.5" : "px-3 py-2",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            loggingOut && "opacity-50 cursor-not-allowed"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {!collapsed && (loggingOut ? "Signing out..." : "Sign out")}
        </button>
      </div>
    </aside>
  );
}
