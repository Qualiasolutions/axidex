"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Briefcase, TrendingUp, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, type Easing } from "motion/react"

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

export function Hero() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <section className="w-full max-w-7xl px-6 pt-24 pb-36 lg:px-12 flex flex-col lg:flex-row items-center gap-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-accent/8 via-accent/4 to-transparent blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Content */}
      <div className="flex-1 flex flex-col gap-10 lg:max-w-xl z-10">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="inline-flex items-center gap-3 self-start rounded-full border border-accent/15 bg-accent/5 px-5 py-2 shadow-sm"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <span className="text-xs font-semibold text-accent tracking-wide uppercase">
            Signal Intelligence Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOutExpo }}
          className="text-5xl md:text-7xl font-serif font-medium text-foreground leading-[1.05] tracking-tight text-balance"
        >
          Turn buying signals into{" "}
          <span className="relative inline-block">
            <span className="italic gradient-text">revenue</span>
            <motion.span
              className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-accent to-orange-400 rounded-full"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: easeOutExpo }}
            />
          </span>
          .
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
          className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light max-w-lg"
        >
          Axidex detects hiring, funding, and expansion signals in real-time. Get AI-powered outreach
          emails that convert prospects into customers.
        </motion.p>

        {/* Email Form */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-1 max-w-sm group">
            <Input
              type="email"
              placeholder="you@company.com"
              className="w-full h-14 bg-white border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-accent/40 focus:ring-accent/20 text-base shadow-sm transition-all duration-300 group-hover:border-border/80 rounded-xl"
              aria-label="Email address"
            />
          </div>
          <Button
            type="submit"
            className="group h-14 px-8 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-md hover:shadow-xl rounded-xl text-base font-medium"
          >
            Start Free Trial
            <ArrowRight className="size-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.form>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
          className="flex items-center gap-6 mt-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Trusted by sales teams at</span>
          <div className="flex gap-5 text-muted-foreground/50">
            <Building2 className="size-5 transition-colors hover:text-muted-foreground" aria-hidden="true" />
            <Briefcase className="size-5 transition-colors hover:text-muted-foreground" aria-hidden="true" />
            <TrendingUp className="size-5 transition-colors hover:text-muted-foreground" aria-hidden="true" />
          </div>
        </motion.div>
      </div>

      {/* Signal Cards Visualization */}
      <div className="flex-1 w-full h-[520px] relative hidden lg:block" style={{ perspective: "1200px" }}>
        <div className="absolute inset-0 bg-accent/10 blur-[100px] rounded-full opacity-25" />

        {/* Signal Feed Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 15, rotateY: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: -8 }}
          transition={{ duration: 0.8, delay: 0.3, ease: easeOutExpo }}
          className="absolute left-6 top-20 w-[380px] bg-white border border-border/60 rounded-2xl shadow-2xl shadow-black/5 overflow-hidden z-10 hover:translate-x-[-8px] hover:translate-y-[-4px] transition-transform duration-500"
          style={{ transform: "rotateX(8deg) rotateY(-8deg) translateZ(-20px)" }}
        >
          <div className="h-12 border-b border-border/50 bg-gradient-to-r from-secondary/80 to-secondary/40 flex items-center px-5 gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Live Signals</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { color: "green", icon: "H", company: "Stripe is hiring 3 SDRs", detail: "San Francisco - 2 hours ago" },
              { color: "blue", icon: "F", company: "Notion raised Series C", detail: "$50M funding round - 4 hours ago" },
              { color: "purple", icon: "E", company: "Figma expanding to EMEA", detail: "New office opening - 6 hours ago" },
            ].map((signal, i) => (
              <motion.div
                key={signal.company}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: easeOutExpo }}
                className={`flex items-start gap-4 p-4 rounded-xl bg-${signal.color}-50/80 border border-${signal.color}-100/80 hover:bg-${signal.color}-50 transition-colors`}
                style={{
                  backgroundColor: signal.color === 'green' ? 'rgb(240 253 244 / 0.8)' :
                                   signal.color === 'blue' ? 'rgb(239 246 255 / 0.8)' :
                                   'rgb(250 245 255 / 0.8)',
                  borderColor: signal.color === 'green' ? 'rgb(220 252 231 / 0.8)' :
                               signal.color === 'blue' ? 'rgb(219 234 254 / 0.8)' :
                               'rgb(243 232 255 / 0.8)'
                }}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold`}
                  style={{
                    backgroundColor: signal.color === 'green' ? 'rgb(34 197 94 / 0.15)' :
                                     signal.color === 'blue' ? 'rgb(59 130 246 / 0.15)' :
                                     'rgb(168 85 247 / 0.15)',
                    color: signal.color === 'green' ? 'rgb(22 163 74)' :
                           signal.color === 'blue' ? 'rgb(37 99 235)' :
                           'rgb(147 51 234)'
                  }}
                >
                  {signal.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{signal.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">{signal.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Email Card */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15, rotateY: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: -8 }}
          transition={{ duration: 0.8, delay: 0.45, ease: easeOutExpo }}
          className="absolute left-28 top-4 w-[360px] bg-white border border-accent/20 rounded-2xl shadow-2xl shadow-accent/5 overflow-hidden z-20 hover:translate-y-[-8px] transition-transform duration-500"
          style={{ transform: "rotateX(8deg) rotateY(-8deg)" }}
        >
          <div className="h-12 border-b border-border/50 bg-gradient-to-r from-accent/10 to-accent/5 flex items-center px-5 justify-between">
            <span className="text-sm font-semibold text-foreground">AI-Generated Outreach</span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold">98% Match</span>
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">To:</span>
              <span className="text-xs text-foreground font-medium">sarah@stripe.com</span>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Subject:</span>
              <span className="text-xs text-foreground font-medium">Congrats on the SDR expansion!</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
              <p>Hi Sarah,</p>
              <p className="mt-3">{"I noticed Stripe is scaling the sales team - congrats! Many teams in your position have found that..."}</p>
              <span className="inline-block mt-2 w-2 h-4 bg-accent rounded-sm animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Conversion Metrics Card */}
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 15, rotateY: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: -8 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeOutExpo }}
          className="absolute left-52 top-56 w-[240px] bg-white border border-accent/25 rounded-2xl shadow-2xl shadow-accent/8 overflow-hidden z-30 hover:translate-x-[8px] hover:translate-y-[8px] transition-transform duration-500"
          style={{ transform: "rotateX(8deg) rotateY(-8deg) translateZ(40px)" }}
        >
          <div className="p-5 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-accent/5 to-transparent">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Reply Rate</span>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">+34%</span>
          </div>
          <div className="relative p-5 flex items-end justify-between gap-2 h-24">
            {[30, 45, 55, 65, 78, 92].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.08 }}
                className="w-full rounded-md"
                style={{
                  background: `linear-gradient(to top, rgba(234, 88, 12, ${0.2 + i * 0.15}), rgba(249, 115, 22, ${0.1 + i * 0.12}))`
                }}
              />
            ))}
          </div>
          <div className="px-5 pb-5 text-center">
            <motion.span
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              47%
            </motion.span>
            <p className="text-xs text-muted-foreground mt-1">avg. reply rate</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
