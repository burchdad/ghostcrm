import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | GhostCRM",
  description: "Login to GhostCRM",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
