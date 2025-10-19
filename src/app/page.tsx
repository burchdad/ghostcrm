// Root page - serves marketing content via middleware rewrite
// This ensures no hydration mismatches for the marketing site
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import MarketingErrorBoundary from '@/components/marketing/MarketingErrorBoundary';

// Dynamically import components to avoid SSR hydration issues
const HeroSection = dynamic(() => import('@/components/marketing/sections/HeroSection'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
});

const FeaturesGrid = dynamic(() => import('@/components/marketing/sections/FeaturesGrid'), {
  ssr: true,
  loading: () => <div className="py-20 bg-white" />
});

const StatsSection = dynamic(() => import('@/components/marketing/sections/StatsSection'), {
  ssr: true,
  loading: () => <div className="py-20 bg-gray-50" />
});

const TestimonialsSection = dynamic(() => import('@/components/marketing/sections/TestimonialsSection'), {
  ssr: true,
  loading: () => <div className="py-20 bg-white" />
});

const CTASection = dynamic(() => import('@/components/marketing/sections/CTASection'), {
  ssr: true,
  loading: () => <div className="py-20 bg-blue-600" />
});

export default function HomePage() {
  return (
    <MarketingErrorBoundary>
      <main className="min-h-screen bg-white">
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div className="py-20 bg-white" />}>
          <FeaturesGrid />
        </Suspense>
        <Suspense fallback={<div className="py-20 bg-gray-50" />}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={<div className="py-20 bg-white" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<div className="py-20 bg-blue-600" />}>
          <CTASection />
        </Suspense>
      </main>
    </MarketingErrorBoundary>
  );
}
