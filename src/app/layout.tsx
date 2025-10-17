import { RibbonProvider } from "@/components/ribbon/RibbonProvider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import CollapseLayout from "@/components/CollapseLayout";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import "../styles/globals.css";  // <— REQUIRED

export const metadata = {
  title: "GhostCRM",
  description: "AI-powered CRM platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          <ThemeProvider>
            <RibbonProvider>
              <CollapseLayout>{children}</CollapseLayout>
            </RibbonProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}