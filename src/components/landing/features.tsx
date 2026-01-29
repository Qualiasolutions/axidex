import { Radar, Mail, Bell, ArrowRight } from "lucide-react"

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
  },
  {
    title: "Integration Guide",
    description: "Connect with your CRM in minutes.",
  },
]

export function Features() {
  return (
    <section id="features" className="w-full max-w-7xl px-6 py-24 lg:px-12">
      {/* Section Header */}
      <div className="mb-20">
        <h2 className="text-4xl font-serif text-foreground mb-6 text-balance">
          Built for modern sales teams.
        </h2>
        <div className="h-px w-24 bg-accent/50" aria-hidden="true" />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="bg-background p-10 group hover:bg-card transition-colors duration-500"
          >
            <div className="mb-6 text-muted-foreground group-hover:text-accent transition-colors">
              <feature.icon className="size-10" strokeWidth={1} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
          </article>
        ))}
      </div>

      {/* Documentation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border-x border-b border-border">
        {links.map((link) => (
          <a
            key={link.title}
            href="#"
            className="bg-background p-10 flex items-center justify-between group hover:bg-card transition-colors"
          >
            <div>
              <h4 className="text-foreground font-medium">{link.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
            </div>
            <ArrowRight
              className="size-5 text-muted group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </a>
        ))}
      </div>
    </section>
  )
}
