import { RibbonProvider } from "@/components/ribbon/RibbonProvider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import CollapseLayout from "@/components/CollapseLayout";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { TenantProvider } from "@/lib/tenant/context";
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
          <TenantProvider>
            <AuthProvider>
              <ThemeProvider>
                <RibbonProvider>
                  <CollapseLayout>{children}</CollapseLayout>
                </RibbonProvider>
              </ThemeProvider>
            </AuthProvider>
          </TenantProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}