import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GhostCRM Dashboard",
  description: "CRM dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}


