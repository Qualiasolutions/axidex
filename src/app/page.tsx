"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    title: "Real-Time Detection",
    description: "Monitor news, job boards, and funding announcements around the clock.",
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
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            Axidex
          </Link>
          <div className="flex items-center gap-6">
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
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-[var(--text-tertiary)] tracking-wide uppercase mb-4"
          >
            Signal Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] leading-[1.1] tracking-tight"
          >
            Be first to every
            <br />
            sales opportunity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed"
          >
            Axidex detects buying signals—hiring, funding, expansion—and delivers them with AI-generated outreach.
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

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-xs text-[var(--text-tertiary)]"
          >
            No credit card required · 14-day trial · Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              Everything to win deals first
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Real-time data collection, AI analysis, and automated outreach.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[var(--bg-primary)] p-8 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <h3 className="text-base font-medium text-[var(--text-primary)]">
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
      <section className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              Signals that drive revenue
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {signalTypes.map((signal, index) => (
              <motion.div
                key={signal}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-4 py-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-default)] text-sm text-[var(--text-secondary)]"
              >
                {signal}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Never miss a deal again
          </h2>
          <p className="mt-4 text-[var(--text-secondary)]">
            Join sales teams using Axidex to find and close deals faster.
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
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-[var(--text-primary)]">Axidex</span>
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} Qualia Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}
