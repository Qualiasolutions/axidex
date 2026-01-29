import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar />
      <div className="ml-64">{children}</div>
    </div>
  );
}
