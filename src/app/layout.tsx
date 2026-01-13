import { Providers } from "./providers";
import GlobalErrorBoundary from "@/components/feedback/GlobalErrorBoundary";
import CollapseLayout from "@/components/layout/CollapseLayout";
import { RouteGuard } from "@/middleware/PermissionMiddleware";
import GlobalAIAssistant from "@/components/global/GlobalAIAssistant";
import QuickAddButton from "@/components/navigation/QuickAddButton";
import GlobalCollaborationButton from "@/components/navigation/GlobalCollaborationButton";
import AIAgentInitializer from "@/components/ai/AIAgentInitializer";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";  // <— REQUIRED
import "../styles/modal.css";    // <— Modal styles
// Import console suppressions to reduce noise from harmless warnings
import "@/utils/console-suppressions";

export const metadata = {
  title: "GhostCRM",
  description: "AI-powered CRM platform",
  other: {
    // Reduce aggressive preloading
    'resource-preloading': 'selective',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900" suppressHydrationWarning={true}>
        <GlobalErrorBoundary>
          <Providers>
            <CollapseLayout>
              <RouteGuard>
                {children}
              </RouteGuard>
            </CollapseLayout>
            {/* Global components that should work on ALL pages */}
            <AIAgentInitializer />
            <GlobalAIAssistant />
            <QuickAddButton />
            <GlobalCollaborationButton />
            <Toaster />
          </Providers>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
