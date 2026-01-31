import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Sidebar />
        <MobileNav />
        {/* Main content area - responsive margin for sidebar, top padding for mobile header */}
        <div className="lg:ml-56 min-h-screen transition-all duration-200 pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
}
