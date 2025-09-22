import "./globals.css";  // <— REQUIRED

export const metadata = {
  title: "GhostCRM",
  description: "AI-powered CRM platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Next.js will inject metadata automatically */}
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
