"use client";

import { memo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Account } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface AccountCardProps {
  account: Account;
  index?: number;
}

export const AccountCard = memo(function AccountCard({ account, index = 0 }: AccountCardProps) {
  return (
    <Link href={`/dashboard/accounts/${encodeURIComponent(account.company_domain || account.company_name)}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.03 }}
        className={cn(
          "group bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]",
          "hover:border-[var(--border-default)] transition-all duration-200 cursor-pointer",
          account.high_priority_count > 0 && "border-l-2 border-l-red-400"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {account.company_logo ? (
              <Image
                src={account.company_logo}
                alt={account.company_name}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized={!account.company_logo.startsWith("https://")}
              />
            ) : (
              <Building2 className="w-6 h-6 text-[var(--text-tertiary)]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-[var(--text-primary)] truncate">
                {account.company_name}
              </h3>
              {account.high_priority_count > 0 && (
                <Badge variant="danger">{account.high_priority_count} high priority</Badge>
              )}
            </div>
            <p className="text-sm text-[var(--text-tertiary)] truncate">
              {account.company_domain || "No domain"}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {account.signal_count}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">signals</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-secondary)]">
                {formatRelativeTime(account.last_signal)}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">last activity</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
