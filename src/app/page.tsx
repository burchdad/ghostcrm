// Root page - serves marketing content directly
// Static imports for reliable production deployment
import MarketingErrorBoundary from '@/components/marketing/MarketingErrorBoundary';
import HeroSection from '@/components/marketing/sections/HeroSection';
import FeaturesGrid from '@/components/marketing/sections/FeaturesGrid';
import StatsSection from '@/components/marketing/sections/StatsSection';
import TestimonialsSection from '@/components/marketing/sections/TestimonialsSection';
import CTASection from '@/components/marketing/sections/CTASection';

export default function HomePage() {
  return (
    <MarketingErrorBoundary>
      <main className="min-h-screen bg-white">
        <HeroSection />
        <FeaturesGrid />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </MarketingErrorBoundary>
  );
}
