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
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]/30">
        <Sidebar />
        <MobileNav />
        {/* Main content area - responsive margin for sidebar, top padding for mobile header */}
        <div className="lg:ml-60 min-h-screen transition-all duration-300 pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
}
