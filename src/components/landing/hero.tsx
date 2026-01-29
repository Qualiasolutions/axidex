"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Briefcase, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export function Hero() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <section className="w-full max-w-7xl px-6 pt-20 pb-32 lg:px-12 flex flex-col lg:flex-row items-center gap-16 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Content */}
      <div className="flex-1 flex flex-col gap-8 lg:max-w-xl z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <span className="text-xs font-medium text-accent tracking-wide uppercase">
            Signal Intelligence Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-serif font-medium text-foreground leading-[1.1] text-balance">
          Turn buying signals into <span className="italic text-accent">revenue</span>.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground leading-relaxed font-light">
          Axidex detects hiring, funding, and expansion signals in real-time. Get AI-powered outreach
          emails that convert prospects into customers.
        </p>

        {/* Email Form */}
        <form className="flex flex-col sm:flex-row gap-4 mt-2" onSubmit={handleSubmit}>
          <div className="relative flex-1 max-w-sm">
            <Input
              type="email"
              placeholder="you@company.com"
              className="w-full h-12 bg-white border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent text-sm"
              aria-label="Email address"
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-8 bg-accent text-white hover:bg-accent/90 transition-all duration-300 shadow-md"
          >
            Start Free Trial
          </Button>
        </form>

        {/* Trust Indicators */}
        <div className="flex items-center gap-6 mt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Trusted by sales teams at</span>
          <div className="flex gap-4 text-muted-foreground/60">
            <Building2 className="size-5" aria-hidden="true" />
            <Briefcase className="size-5" aria-hidden="true" />
            <TrendingUp className="size-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Signal Cards Visualization */}
      <div className="flex-1 w-full h-[500px] relative hidden lg:block" style={{ perspective: "1000px" }}>
        <div className="absolute inset-0 bg-accent/10 blur-[100px] rounded-full opacity-30" />

        {/* Signal Feed Card */}
        <div
          className="absolute left-10 top-20 w-[380px] bg-white border border-border rounded-xl shadow-xl overflow-hidden z-10 transition-all duration-500 hover:translate-x-[-10px] hover:translate-y-[-5px]"
          style={{ transform: "rotateX(8deg) rotateY(-8deg) translateZ(-20px) translateX(-10px)" }}
        >
          <div className="h-10 border-b border-border bg-secondary/50 flex items-center px-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-foreground">Live Signals</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 text-xs font-bold">H</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Stripe is hiring 3 SDRs</p>
                <p className="text-xs text-muted-foreground mt-0.5">San Francisco - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">F</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Notion raised Series C</p>
                <p className="text-xs text-muted-foreground mt-0.5">$50M funding round - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 text-xs font-bold">E</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Figma expanding to EMEA</p>
                <p className="text-xs text-muted-foreground mt-0.5">New office opening - 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Email Card */}
        <div
          className="absolute left-32 top-8 w-[360px] bg-white border border-border rounded-xl shadow-2xl overflow-hidden z-20 transition-all duration-500 hover:translate-y-[-10px]"
          style={{ transform: "rotateX(8deg) rotateY(-8deg)" }}
        >
          <div className="h-10 border-b border-border bg-accent/5 flex items-center px-4 justify-between">
            <span className="text-xs font-medium text-foreground">AI-Generated Outreach</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">98% Match</span>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <span className="text-xs text-muted-foreground">To:</span>
              <span className="text-xs text-foreground ml-2">sarah@stripe.com</span>
            </div>
            <div className="mb-3">
              <span className="text-xs text-muted-foreground">Subject:</span>
              <span className="text-xs text-foreground ml-2">Congrats on the SDR expansion!</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
              <p>Hi Sarah,</p>
              <p className="mt-2">{"I noticed Stripe is scaling the sales team - congrats! Many teams in your position have found that..."}</p>
              <span className="inline-block mt-2 text-accent animate-pulse">|</span>
            </div>
          </div>
        </div>

        {/* Conversion Metrics Card */}
        <div
          className="absolute left-56 top-52 w-[240px] bg-white border border-accent/20 rounded-xl shadow-lg overflow-hidden z-30 flex flex-col transition-all duration-500 hover:translate-x-[10px] hover:translate-y-[10px]"
          style={{ transform: "rotateX(8deg) rotateY(-8deg) translateZ(40px) translateX(10px) translateY(10px)" }}
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Reply Rate</span>
            <span className="text-xs text-green-600 font-medium">+34%</span>
          </div>
          <div className="flex-1 relative p-4 flex items-end justify-between gap-1.5">
            <div className="w-full bg-accent/20 h-[30%] rounded-sm" />
            <div className="w-full bg-accent/30 h-[45%] rounded-sm" />
            <div className="w-full bg-accent/40 h-[55%] rounded-sm" />
            <div className="w-full bg-accent/50 h-[65%] rounded-sm" />
            <div className="w-full bg-accent/70 h-[78%] rounded-sm" />
            <div className="w-full bg-accent h-[92%] rounded-sm shadow-md" />
          </div>
          <div className="px-4 pb-3 text-center">
            <span className="text-2xl font-bold text-foreground">47%</span>
            <p className="text-[10px] text-muted-foreground">avg. reply rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}
