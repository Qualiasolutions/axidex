import Link from "next/link"
import { Zap } from "lucide-react"

const platformLinks = [
  { href: "#", label: "Signal Types" },
  { href: "#", label: "AI Outreach" },
  { href: "#", label: "Integrations" },
  { href: "#", label: "API" },
]

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Customers" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Privacy" },
]

const socialLinks = [
  { href: "#", label: "X", ariaLabel: "Follow us on X" },
  { href: "#", label: "In", ariaLabel: "Connect on LinkedIn" },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-secondary/50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          {/* Brand Section */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Zap className="size-8 text-accent" aria-hidden="true" />
              <span className="text-xl font-serif font-bold text-foreground">Axidex</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Signal intelligence for modern sales teams. Turn buying intent into revenue.
              <br />
              <br />
              San Francisco, CA.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="size-8 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.ariaLabel}
                >
                  <span className="text-xs font-bold">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
            {/* Platform Links */}
            <nav className="flex flex-col gap-4" aria-label="Platform">
              <h4 className="font-serif text-foreground">Platform</h4>
              {platformLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Company Links */}
            <nav className="flex flex-col gap-4" aria-label="Company">
              <h4 className="font-serif text-foreground">Company</h4>
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Contact */}
            <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
              <h4 className="font-serif text-foreground">Contact</h4>
              <a
                href="mailto:hello@axidex.com"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                hello@axidex.com
              </a>
              <a href="tel:+14155551234" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                +1 (415) 555-1234
              </a>
              <p className="text-sm text-muted-foreground">
                548 Market St, Suite 12345
                <br />
                San Francisco, CA 94104
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Axidex Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
