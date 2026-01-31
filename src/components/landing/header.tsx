"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { Easing } from "motion/react"

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const navLinks = [
  { href: "#signals", label: "Signals" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="flex h-20 items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-accent to-orange-500 text-white shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30 transition-shadow duration-300">
            <Zap className="size-5" />
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">Axidex</h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="group h-11 px-6 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-md hover:shadow-lg">
              Get Started
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-6 gap-2" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: easeOutExpo }}
                >
                  <Link
                    href={link.href}
                    className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: easeOutExpo }}
                className="flex flex-col gap-3 pt-6 mt-4 border-t border-border/50"
              >
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-foreground text-background hover:bg-foreground/90 w-full">
                    Get Started
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
