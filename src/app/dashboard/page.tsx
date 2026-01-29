import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SignalCard } from "@/components/signals/signal-card";
import { Zap, TrendingUp, Target, Mail } from "lucide-react";
import type { Signal } from "@/types";

const mockSignals: Signal[] = [
  {
    id: "1",
    company_name: "TechCorp Inc",
    company_domain: "techcorp.com",
    signal_type: "funding",
    title: "TechCorp Raises $50M Series B",
    summary: "TechCorp announced a $50M Series B funding round led by Sequoia Capital, signaling major expansion plans for their AI platform.",
    source_url: "https://techcrunch.com/example",
    source_name: "TechCrunch",
    priority: "high",
    status: "new",
    detected_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date().toISOString(),
    metadata: { funding_amount: "$50M", industry: "AI/ML" },
  },
  {
    id: "2",
    company_name: "DataFlow Systems",
    company_domain: "dataflow.io",
    signal_type: "hiring",
    title: "DataFlow Hiring 15 Enterprise Sales Reps",
    summary: "DataFlow Systems posted 15 new enterprise sales positions across NA and EMEA, indicating aggressive growth targets for Q1.",
    source_url: "https://linkedin.com/jobs/example",
    source_name: "LinkedIn",
    priority: "high",
    status: "new",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date().toISOString(),
    metadata: { job_titles: ["Enterprise AE", "Sr. Sales Manager"], location: "NA, EMEA" },
  },
  {
    id: "3",
    company_name: "CloudScale",
    company_domain: "cloudscale.com",
    signal_type: "expansion",
    title: "CloudScale Opens New APAC Headquarters",
    summary: "CloudScale announced the opening of their new Asia-Pacific headquarters in Singapore, targeting regional enterprise customers.",
    source_url: "https://prnewswire.com/example",
    source_name: "PR Newswire",
    priority: "medium",
    status: "reviewed",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    created_at: new Date().toISOString(),
    metadata: { location: "Singapore" },
  },
  {
    id: "4",
    company_name: "FinanceAI",
    company_domain: "financeai.com",
    signal_type: "leadership_change",
    title: "FinanceAI Appoints New CRO from Salesforce",
    summary: "FinanceAI announced the appointment of Sarah Chen as Chief Revenue Officer, previously VP of Enterprise Sales at Salesforce.",
    source_url: "https://businesswire.com/example",
    source_name: "Business Wire",
    priority: "medium",
    status: "new",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Here's your signal overview." />
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Signals Today"
            value={127}
            change={{ value: 12, trend: "up" }}
            icon={Zap}
          />
          <StatsCard
            title="High Priority"
            value={23}
            change={{ value: 8, trend: "up" }}
            icon={Target}
          />
          <StatsCard
            title="Conversion Rate"
            value="18.5%"
            change={{ value: 3, trend: "up" }}
            icon={TrendingUp}
          />
          <StatsCard
            title="Emails Generated"
            value={45}
            change={{ value: 15, trend: "up" }}
            icon={Mail}
          />
        </div>

        {/* Recent Signals */}
        <div className="bg-[#1e293b]/50 rounded-xl p-6 border border-[#334155]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Signals</h2>
            <a href="/dashboard/signals" className="text-sm text-[#00a4ac] hover:text-[#00c4cc]">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {mockSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
