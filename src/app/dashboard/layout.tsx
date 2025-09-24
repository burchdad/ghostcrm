import type { Metadata } from "next";
import { CollapseProvider, CollapseResizer } from "@/components/collapse";

export const metadata: Metadata = {
  title: "GhostCRM Dashboard",
  description: "CRM dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CollapseProvider>
      <div className="min-h-screen overflow-hidden bg-gray-50">
        {/* Only dashboard-specific content and resizer */}
        <div style={{ display: "flex", height: "100vh" }}>
          <CollapseResizer />
          <main className="flex-1">
            <div className="overflow-y-auto" style={{ height: "100%" }}>
              <div className="max-w-screen-2xl mx-auto px-4 py-4">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </CollapseProvider>
  );
}


