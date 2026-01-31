"use client"

import { Quote } from "lucide-react"
import Image from "next/image"
import { motion } from "motion/react"
import type { Easing } from "motion/react"

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

export function Testimonial() {
  return (
    <section className="w-full py-28 lg:py-32 border-t border-border/50 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(234,88,12,0.08),transparent)]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
        >
          <Quote className="size-16 lg:size-20 text-accent/15 mx-auto mb-10" aria-hidden="true" />
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOutExpo }}
          className="text-2xl md:text-4xl lg:text-5xl font-serif text-foreground leading-snug mb-10 text-balance tracking-tight"
        >
          {
            "\"Axidex changed how we approach outbound. We went from generic blasts to perfectly-timed, signal-driven conversations. Our reply rate jumped from 12% to 47%.\""
          }
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
          className="flex flex-col items-center gap-4"
        >
          <div className="size-14 rounded-full border-2 border-accent/20 overflow-hidden shadow-lg shadow-accent/10">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
              alt="Sarah Chen portrait"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <cite className="text-foreground font-semibold text-lg not-italic block">Sarah Chen</cite>
            <p className="text-accent text-xs uppercase tracking-widest mt-1 font-medium">VP of Sales @ TechScale</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
