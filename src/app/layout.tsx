import "../styles/globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { LucidePhone } from "lucide-react";
// Remove usePathname; use segment for route detection

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Next.js App Router: /login uses its own layout, so always render dashboard for other routes
  // Use Next.js segment detection to avoid rendering dashboard/sidebar for /login
  return (
    <html lang="en">
      <head>
        <title>GhostCRM Dashboard</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GhostCRM - Advanced CRM Dashboard" />
      </head>
      <body className="bg-gray-50">
        <main className="min-h-screen flex flex-col">
          {/* Dashboard layout */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-4">
              <div className="font-bold text-xl mb-4 text-blue-700">Ghost Auto CRM</div>
              {/* ...sidebar content... */}
            </aside>
            {/* Main dashboard content */}
            <section className="flex-1 p-6">
              {children}
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
