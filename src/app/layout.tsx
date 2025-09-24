import { RibbonProvider } from "@/components/ribbon/RibbonProvider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import { CollapseProvider } from "@/components/collapse";
import "../styles/globals.css";  // <— REQUIRED

export const metadata = {
  title: "GhostCRM",
  description: "AI-powered CRM platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 min-h-screen">
        <GlobalErrorBoundary>
          <RibbonProvider>
            <CollapseProvider>
              <div className="min-h-screen overflow-hidden bg-gray-50">
                {/* Topbar spans full width */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm">
                  <Topbar />
                </header>
                {/* Ribbon is now rendered globally for consistent UI */}
                <div
                  className="fixed z-40 left-0 right-0"
                  style={{ top: "var(--header-h)", height: "var(--ribbon-h)" }}
                >
                  <div className="h-full bg-gray-100 border-b px-3 md:px-4 flex items-center">
                    <Ribbon />
                  </div>
                </div>
                {/* Sidebar below Topbar/Ribbon */}
                <div style={{ display: "flex", height: "100vh", paddingTop: "calc(var(--header-h) + var(--ribbon-h))" }}>
                  <aside
                    className="bg-white shadow-md rounded-tr-2xl border-r"
                    style={{
                      width: "var(--sidebar-w)",
                      transition: "width 200ms ease",
                      height: "100%"
                    }}
                  >
                    <div className="h-full overflow-y-auto">
                      <Sidebar />
                    </div>
                  </aside>
                  {/* Main content */}
                  <main className="flex-1">
                    <div className="overflow-y-auto" style={{ height: "100%" }}>
                      <div className="max-w-screen-2xl mx-auto px-4 py-4">{children}</div>
                    </div>
                  </main>
                </div>
              </div>
            </CollapseProvider>
          </RibbonProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
