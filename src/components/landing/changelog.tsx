"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import type { Easing } from "motion/react"

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const updates = [
  {
    version: "New",
    date: "January 24, 2026",
    title: "LinkedIn Signal Integration",
    description:
      "Now tracking job changes, promotions, and company updates directly from LinkedIn. Get notified when key decision-makers move roles.",
    isLatest: true,
  },
  {
    version: "Update",
    date: "January 12, 2026",
    title: "Enhanced AI Email Generation",
    description:
      "GPT-4 powered outreach with improved personalization. References up to 5 recent signals per email for maximum relevance.",
    isLatest: false,
  },
  {
    version: "Feature",
    date: "December 28, 2025",
    title: "Salesforce Integration",
    description:
      "Two-way sync with Salesforce. Automatically enrich leads with signal data and track outreach performance.",
    isLatest: false,
  },
]

export function Changelog() {
  return (
    <section id="how-it-works" className="w-full border-y border-border/50 bg-gradient-to-b from-secondary/30 to-secondary/10">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:px-12 lg:py-24 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="md:col-span-1"
        >
          <h3 className="text-2xl font-serif text-foreground mb-3">{"What's New"}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            New signals and features.
            <br />
            Every single week.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-accent mt-6 font-semibold hover:gap-2.5 transition-all duration-300 group"
          >
            Get started free
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Timeline */}
        <div className="md:col-span-3">
          <div className="relative pl-8 border-l-2 border-border/60 space-y-12">
            {updates.map((update, index) => (
              <motion.article
                key={update.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutExpo }}
                className="relative group"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[33px] top-1.5 size-4 rounded-full border-2 border-background transition-all duration-300 group-hover:scale-125 ${
                    update.isLatest
                      ? "bg-accent shadow-lg shadow-accent/30"
                      : "bg-muted-foreground/40 group-hover:bg-accent"
                  }`}
                />

                {/* Content */}
                <div className="flex items-baseline gap-4 mb-2">
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                      update.isLatest
                        ? "text-accent bg-accent/10"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {update.version}
                  </span>
                  <time className="text-xs text-muted-foreground/70">{update.date}</time>
                </div>
                <h4 className={`font-semibold text-lg mb-2 transition-colors ${update.isLatest ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                  {update.title}
                </h4>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  {update.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
