import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      {/* Main content area - responsive margin for sidebar */}
      <div className="lg:ml-60 min-h-screen transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
