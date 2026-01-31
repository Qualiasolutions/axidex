"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SignalCard } from "@/components/signals/signal-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { DashboardStats, Signal } from "@/types";
import { useRealtimeSignals } from "@/hooks/use-realtime-signals";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Get user ID
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch stats and recent signals in parallel
        const [statsRes, signalsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/signals?limit=5")
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (signalsRes.ok) {
          const signalsData = await signalsRes.json();
          setRecentSignals(signalsData.signals || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle new signal from realtime subscription
  const handleNewSignal = useCallback((newSignal: Signal) => {
    // Add new signal to top of list
    setRecentSignals(prev => [newSignal, ...prev].slice(0, 5));

    // Update stats
    setStats(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        total_signals: prev.total_signals + 1,
        new_signals: prev.new_signals + 1,
        high_priority: newSignal.priority === "high" ? prev.high_priority + 1 : prev.high_priority,
      };
    });

    // Brief highlight animation handled by SignalCard
  }, []);

  // Subscribe to realtime updates
  useRealtimeSignals(userId || "", handleNewSignal);

  // Loading skeleton
  if (loading) {
    return (
      <>
        <Header title="Overview" subtitle="Your signal intelligence at a glance" />
        <main className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)] animate-pulse"
              >
                <div className="h-4 bg-[var(--border-subtle)] rounded w-24 mb-3"></div>
                <div className="h-8 bg-[var(--border-subtle)] rounded w-16"></div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  // No user logged in
  if (!userId) {
    return (
      <>
        <Header title="Overview" subtitle="Your signal intelligence at a glance" />
        <main className="p-6 lg:p-8 space-y-8">
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">Please log in to view your dashboard.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Overview" subtitle="Your signal intelligence at a glance" />
      <main className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total Signals"
            value={stats?.total_signals.toString() || "0"}
            index={0}
          />
          <StatsCard
            title="High Priority"
            value={stats?.high_priority.toString() || "0"}
            index={1}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversion_rate || 0}%`}
            index={2}
          />
          <StatsCard
            title="Emails Drafted"
            value={stats?.emails_drafted.toString() || "0"}
            index={3}
          />
        </div>

        {/* Recent Signals */}
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

          {/* Signals list or empty state */}
          {recentSignals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                No signals yet
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] max-w-sm mb-8">
                Configure your signal sources to start detecting buying signals from news, job boards, and funding announcements.
              </p>
              <Link href="/dashboard/signals">
                <Button variant="default" size="sm">
                  View All Signals
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {recentSignals.map((signal, index) => (
                <SignalCard key={signal.id} signal={signal} index={index} />
              ))}
            </div>
          )}
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
              title: "View Signals",
              description: "Browse and filter all detected buying signals",
              href: "/dashboard/signals",
            },
            {
              title: "Configure Alerts",
              description: "Set up email notifications for new signals",
              href: "/dashboard/settings",
            },
            {
              title: "Account Settings",
              description: "Manage your profile and preferences",
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
