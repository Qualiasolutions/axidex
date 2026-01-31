"use client"

import { Radar, Mail, Bell, ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import type { Easing } from "motion/react"

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const features = [
  {
    icon: Radar,
    title: "Signal Detection",
    description:
      "Monitor hiring posts, funding announcements, and expansion news across thousands of companies in real-time.",
  },
  {
    icon: Mail,
    title: "AI-Powered Outreach",
    description:
      "Generate personalized emails that reference specific signals, increasing reply rates by up to 3x compared to templates.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified the moment your target accounts show buying intent. Never miss a perfect timing opportunity again.",
  },
]

const links = [
  {
    title: "View Signal Types",
    description: "Explore 50+ buying intent signals we track.",
    href: "/signup",
  },
  {
    title: "Get Started",
    description: "Start detecting signals in minutes.",
    href: "/signup",
  },
]

export function Features() {
  return (
    <section id="features" className="w-full max-w-7xl px-6 py-28 lg:px-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6 text-balance tracking-tight">
          Built for modern sales teams.
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent to-orange-400 rounded-full" aria-hidden="true" />
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/50 border border-border/50 rounded-2xl overflow-hidden">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutExpo }}
            className="bg-background p-10 lg:p-12 group hover:bg-gradient-to-br hover:from-accent/[0.03] hover:to-transparent transition-all duration-500"
          >
            <div className="mb-8 text-muted-foreground/60 group-hover:text-accent transition-colors duration-500">
              <feature.icon className="size-12 lg:size-14" strokeWidth={1} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-foreground/90 transition-colors">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </div>

      {/* Documentation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/50 border-x border-b border-border/50 rounded-b-2xl overflow-hidden -mt-px">
        {links.map((link, index) => (
          <motion.a
            key={link.title}
            href={link.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: easeOutExpo }}
            className="bg-background p-10 flex items-center justify-between group hover:bg-secondary/40 transition-all duration-300"
          >
            <div>
              <h4 className="text-foreground font-semibold text-lg group-hover:text-accent transition-colors duration-300">
                {link.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1.5">
                {link.description}
              </p>
            </div>
            <ArrowRight
              className="size-5 text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300"
              aria-hidden="true"
            />
          </motion.a>
        ))}
      </div>
    </section>
  )
}
