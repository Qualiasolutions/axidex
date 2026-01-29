"use client";

import { Button } from "@/components/ui/button";
import { Bell, Search, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-[#64748b]">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search signals..."
              className="w-64 h-9 pl-9 pr-4 rounded-lg bg-[#1e293b] border border-[#334155] text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00a4ac] focus:border-transparent"
            />
          </div>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00a4ac] rounded-full text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </Button>

          <Button variant="primary" size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Add Source
          </Button>
        </div>
      </div>
    </header>
  );
}
