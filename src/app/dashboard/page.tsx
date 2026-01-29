"use client";

import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <Header title="Overview" subtitle="Your signal intelligence at a glance" />
      <main className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total Signals"
            value="—"
            index={0}
          />
          <StatsCard
            title="High Priority"
            value="—"
            index={1}
          />
          <StatsCard
            title="Conversion Rate"
            value="—"
            index={2}
          />
          <StatsCard
            title="Emails Drafted"
            value="—"
            index={3}
          />
        </div>

        {/* Empty State - Recent Signals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Recent Signals</h2>
            <Link
              href="/dashboard/signals"
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Empty state content */}
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
              No signals yet
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-sm mb-8">
              Configure your signal sources to start detecting buying signals from news, job boards, and funding announcements.
            </p>
            <Button variant="default" size="sm">
              Add Signal Source
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              title: "Add Sources",
              description: "Configure news feeds, job boards, and PR sources",
              href: "/dashboard/rules",
            },
            {
              title: "Import Accounts",
              description: "Upload your target account list to track",
              href: "/dashboard/accounts",
            },
            {
              title: "Configure Alerts",
              description: "Set up Slack, email, or webhook notifications",
              href: "/dashboard/settings",
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
            >
              <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {action.description}
              </p>
            </Link>
          ))}
        </motion.div>
      </main>
    </>
  );
}
