import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>GhostCRM Dashboard</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GhostCRM - Advanced CRM Dashboard" />
      </head>
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Topbar */}
          <Topbar />

          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-4">
              <div className="font-bold text-xl mb-4 text-blue-700">
                Ghost Auto CRM
              </div>
              <Sidebar />
            </aside>

            {/* Main dashboard content */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
