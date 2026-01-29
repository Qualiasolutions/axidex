import { Header } from "@/components/layout/header";
import { SignalCard } from "@/components/signals/signal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, SlidersHorizontal } from "lucide-react";
import type { Signal, SignalType } from "@/types";

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
  {
    id: "5",
    company_name: "SecureNet",
    company_domain: "securenet.io",
    signal_type: "product_launch",
    title: "SecureNet Launches Enterprise Security Suite",
    summary: "SecureNet unveiled their new Enterprise Security Suite featuring AI-powered threat detection and automated response capabilities.",
    source_url: "https://venturebeat.com/example",
    source_name: "VentureBeat",
    priority: "medium",
    status: "new",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    company_name: "AutomateHQ",
    company_domain: "automatehq.com",
    signal_type: "partnership",
    title: "AutomateHQ Partners with Microsoft",
    summary: "AutomateHQ announced a strategic partnership with Microsoft to integrate their automation platform with Azure and Teams.",
    source_url: "https://microsoft.com/blog/example",
    source_name: "Microsoft Blog",
    priority: "high",
    status: "contacted",
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date().toISOString(),
  },
];

const signalFilters: { type: SignalType; label: string }[] = [
  { type: "hiring", label: "Hiring" },
  { type: "funding", label: "Funding" },
  { type: "expansion", label: "Expansion" },
  { type: "partnership", label: "Partnership" },
  { type: "product_launch", label: "Product Launch" },
  { type: "leadership_change", label: "Leadership" },
];

export default function SignalsPage() {
  return (
    <>
      <Header title="Signals" subtitle="Monitor and act on buying signals in real-time." />
      <main className="p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              All Signals
            </Button>
            <div className="flex items-center gap-1 ml-2">
              {signalFilters.map((filter) => (
                <button
                  key={filter.type}
                  className="px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Signal Stats Bar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#1e293b]/50 rounded-lg border border-[#334155]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748b]">Showing</span>
            <Badge variant="info">{mockSignals.length} signals</Badge>
          </div>
          <div className="h-4 w-px bg-[#334155]" />
          <div className="flex items-center gap-2">
            <Badge variant="danger">{mockSignals.filter(s => s.priority === "high").length} high priority</Badge>
            <Badge variant="info">{mockSignals.filter(s => s.status === "new").length} new</Badge>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {mockSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="secondary">Load More Signals</Button>
        </div>
      </main>
    </>
  );
}
