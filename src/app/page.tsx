"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    title: "Real-Time Detection",
    description: "Monitor news, job boards, and funding announcements 24/7.",
  },
  {
    title: "AI Classification",
    description: "Smart intent scoring prioritizes the hottest leads first.",
  },
  {
    title: "Auto Outreach",
    description: "AI-generated emails personalized to each signal.",
  },
  {
    title: "Multi-Channel",
    description: "Deliver via dashboard, Slack, Teams, or email.",
  },
];

const signalTypes = [
  "Hiring Signals",
  "Funding Events",
  "Expansion News",
  "Leadership Changes",
  "Product Launches",
  "Partnerships",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--bg-primary)]" />
            </div>
            <span className="text-base font-semibold text-[var(--text-primary)]">PULSE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-muted)] border border-[var(--accent-border)] text-[var(--accent)] text-xs font-medium mb-6">
              <Zap className="w-3 h-3" />
              Signal Intelligence
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] leading-[1.1] tracking-tight"
          >
            Be first to every
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-cyan-400">
              sales opportunity
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed"
          >
            PULSE detects buying signals—hiring, funding, expansion—and delivers
            them with AI-generated outreach emails.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Book a Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-tertiary)]"
          >
            {["No credit card", "14-day trial", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "50K+", label: "Signals / Day" },
              { value: "2.5×", label: "More Pipeline" },
              { value: "85%", label: "Time Saved" },
              { value: "3min", label: "Detection" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl font-semibold text-[var(--accent)] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              Everything to win deals first
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              Real-time data collection, AI analysis, and automated outreach in one platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
              >
                <h3 className="text-base font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal Types */}
      <section className="py-24 px-6 bg-[var(--bg-secondary)]/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              Signals that drive revenue
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {signalTypes.map((signal, index) => (
              <motion.div
                key={signal}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                {signal}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Never miss a deal again
          </h2>
          <p className="mt-4 text-[var(--text-secondary)]">
            Join sales teams using PULSE to find and close deals faster.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[var(--accent)] to-cyan-400 flex items-center justify-center">
              <Zap className="w-3 h-3 text-[var(--bg-primary)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">PULSE</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} Qualia Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
