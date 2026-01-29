"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "#signals", label: "Signals" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-accent text-white shadow-md">
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
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-sm font-medium text-foreground hover:text-accent">
            Log In
          </Button>
          <Button className="group h-10 px-5 bg-accent text-white hover:bg-accent/90 transition-all duration-300 shadow-md">
            Get Started
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
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
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-4 gap-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Button variant="ghost" className="justify-start text-foreground">
                Log In
              </Button>
              <Button className="bg-accent text-white hover:bg-accent/90">
                Get Started
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
