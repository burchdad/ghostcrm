// ❌ REMOVED: Layout wrapper conflicts with custom billing page design
// The main billing page (page.tsx) handles its own full-screen layout with glassmorphism
// This layout was adding conflicting styles (bg-gray-50, headers, footers)

// If you need this layout in the future, consider using it only for 
// success/cancel pages that need a simpler design

export const metadata = {
  title: "Billing - GhostCRM",
  description: "Secure billing and payment processing",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  // Pass-through layout - let billing pages handle their own styling
  return <>{children}</>;
}