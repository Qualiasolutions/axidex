import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Zap,
  Mail,
  Bell,
  ArrowRight,
  CheckCircle,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Signal Detection",
    description:
      "Monitors news, job boards, funding announcements, and PR feeds 24/7 to catch buying signals the moment they happen.",
  },
  {
    icon: Target,
    title: "AI-Powered Intent Classification",
    description:
      "Advanced AI classifies signals by buyer intent, helping you prioritize the hottest leads first.",
  },
  {
    icon: Mail,
    title: "Auto-Generated Outreach",
    description:
      "Get personalized, ready-to-send emails crafted by AI that reference the specific signal detected.",
  },
  {
    icon: Bell,
    title: "Multi-Channel Delivery",
    description:
      "Receive signals via dashboard, Slack, Teams, or email - however your team works best.",
  },
];

const signalTypes = [
  { name: "Hiring Signals", description: "New job postings indicating growth" },
  { name: "Funding Events", description: "Series A, B, C rounds and acquisitions" },
  { name: "Expansion News", description: "New offices, markets, and territories" },
  { name: "Leadership Changes", description: "New C-suite and VP appointments" },
  { name: "Product Launches", description: "New products and feature releases" },
  { name: "Partnership Announcements", description: "Strategic partnerships and integrations" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navigation */}
      <nav className="border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00a4ac] to-[#00c4cc] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PULSE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#94a3b8] hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a4ac]/10 border border-[#00a4ac]/20 text-[#00c4cc] text-sm mb-6">
            <Zap className="w-4 h-4" />
            Signal Intelligence Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Be First to Every{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a4ac] to-[#00c4cc]">
              Sales Opportunity
            </span>
          </h1>
          <p className="mt-6 text-xl text-[#94a3b8] max-w-2xl mx-auto">
            PULSE monitors the web for buying signals - hiring, funding, expansion news - and
            delivers them to your sales team with AI-generated outreach emails.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[#64748b]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00a4ac]" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00a4ac]" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00a4ac]" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[#1e293b] bg-[#0f172a]/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50K+", label: "Signals Detected Daily" },
            { value: "2.5x", label: "More Pipeline Generated" },
            { value: "85%", label: "Time Saved on Research" },
            { value: "3min", label: "Average Detection Time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00c4cc]">{stat.value}</div>
              <div className="text-sm text-[#64748b] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Everything You Need to Win Deals First
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">
              PULSE combines real-time data collection, AI analysis, and automated outreach into one
              powerful platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#00a4ac]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00a4ac]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#00a4ac]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-[#94a3b8]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal Types */}
      <section className="py-24 px-6 bg-[#1e293b]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Signals That Drive Revenue
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">
              Track the buying signals that matter most to your business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {signalTypes.map((signal) => (
              <div
                key={signal.name}
                className="bg-[#0f172a] rounded-lg p-5 border border-[#334155]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00a4ac]" />
                  <h3 className="font-medium text-white">{signal.name}</h3>
                </div>
                <p className="mt-2 text-sm text-[#64748b] ml-5">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Never Miss a Deal Again?
          </h2>
          <p className="mt-4 text-[#94a3b8] max-w-xl mx-auto">
            Join hundreds of sales teams using PULSE to find and close deals faster.
          </p>
          <div className="mt-10">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2">
                Start Your Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00a4ac] to-[#00c4cc] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">PULSE</span>
          </div>
          <p className="text-sm text-[#64748b]">
            © {new Date().getFullYear()} Qualia Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
