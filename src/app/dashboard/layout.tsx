import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import GlobalBar from "@/components/GlobalBar";

export const metadata: Metadata = {
  title: "GhostCRM Dashboard",
  description: "CRM dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      {/* GlobalBar is fixed at the very top, like an Excel/Word menu bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4" style={{ minHeight: "var(--ribbon-h)" }}>
        <GlobalBar />
      </div>

      {/* Topbar is fixed below GlobalBar */}
      <header className="fixed left-0 right-0 z-40 h-16 bg-white shadow-sm" style={{ top: "var(--ribbon-h)" }}>
        <Topbar />
      </header>

      {/* Sidebar starts below GlobalBar and Topbar, not overlapped */}
      <aside
        className="fixed left-0 bottom-0 z-30 hidden md:block bg-white shadow-md rounded-tr-2xl"
        style={{ top: "calc(var(--ribbon-h) + var(--header-h))", width: "var(--sidebar-w)" }}
        aria-label="Sidebar Navigation"
      >
        <Sidebar />
      </aside>

      {/* Main content is scrollable, offset for both GlobalBar and Topbar */}
      <main className="pt-[calc(var(--ribbon-h)+var(--header-h))] md:pl-[var(--sidebar-w)]">
        <div className="overflow-y-auto" style={{ height: "calc(100vh - var(--ribbon-h) - var(--header-h))" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
