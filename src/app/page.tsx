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
        
        {/* Debug separator */}
        <div className="bg-red-500 text-white text-center py-4 text-xl font-bold">
          🔥 FEATURES SECTION BELOW 🔥
        </div>
        <FeaturesGrid />
        
        {/* Debug separator */}
        <div className="bg-blue-500 text-white text-center py-4 text-xl font-bold">
          📊 STATS SECTION BELOW 📊
        </div>
        <StatsSection />
        
        {/* Debug separator */}  
        <div className="bg-green-500 text-white text-center py-4 text-xl font-bold">
          💬 TESTIMONIALS SECTION BELOW 💬
        </div>
        <TestimonialsSection />
        
        {/* Debug separator */}
        <div className="bg-purple-500 text-white text-center py-4 text-xl font-bold">
          🚀 CTA SECTION BELOW 🚀
        </div>
        <CTASection />
        
        {/* Final separator */}
        <div className="bg-black text-white text-center py-4 text-xl font-bold">
          ✅ END OF MARKETING SITE ✅
        </div>
      </main>
    </MarketingErrorBoundary>
  );
}
