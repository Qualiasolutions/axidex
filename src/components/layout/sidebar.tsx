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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Signals", href: "/dashboard/signals", icon: Zap },
  { name: "Email Drafts", href: "/dashboard/emails", icon: Mail },
  { name: "Accounts", href: "/dashboard/accounts", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Signal Rules", href: "/dashboard/rules", icon: Target },
];

const bottomNavigation = [
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] border-r border-[#1e293b] flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00a4ac] to-[#00c4cc] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PULSE</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#00a4ac]/10 text-[#00c4cc]"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-6">
        <ul className="space-y-1 border-t border-[#1e293b] pt-4">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#00a4ac]/10 text-[#00c4cc]"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
