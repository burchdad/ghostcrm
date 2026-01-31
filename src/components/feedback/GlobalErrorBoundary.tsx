"use client";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

export default function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
