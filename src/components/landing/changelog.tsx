import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
    <section id="how-it-works" className="w-full border-y border-border bg-secondary/30">
      <div className="max-w-5xl mx-auto px-6 py-16 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Section Header */}
        <div className="md:col-span-1">
          <h3 className="text-xl font-serif text-foreground mb-2">{"What's New"}</h3>
          <p className="text-sm text-muted-foreground">
            New signals and features.
            <br />
            Every single week.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 text-xs text-accent mt-4 font-medium hover:underline"
          >
            Get started free <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Timeline */}
        <div className="md:col-span-3">
          <div className="relative pl-6 border-l border-border space-y-10">
            {updates.map((update) => (
              <article key={update.version} className="relative group">
                <div
                  className={`absolute -left-[29px] top-1.5 size-3 rounded-full border border-background transition-transform group-hover:scale-125 ${
                    update.isLatest ? "bg-accent" : "bg-muted-foreground group-hover:bg-accent"
                  }`}
                />
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`font-mono text-xs ${update.isLatest ? "text-accent" : "text-muted-foreground"}`}>
                    {update.version}
                  </span>
                  <time className="text-xs text-muted">{update.date}</time>
                </div>
                <h4 className={`font-medium mb-1 ${update.isLatest ? "text-foreground" : "text-foreground/80"}`}>
                  {update.title}
                </h4>
                <p className="text-sm text-muted-foreground max-w-xl">{update.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
