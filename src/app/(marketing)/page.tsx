import React from "react";
import Link from "next/link";
import { 
  ArrowRight, CheckCircle, Star, Users, TrendingUp, Zap, Shield,
  BarChart3, Calendar, Workflow, Database, Globe, Target
} from "lucide-react";

export default function MarketingHomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Automotive Sales
              </span>
              <br />with Intelligent CRM
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your dealership operations, boost sales by 40%, and deliver exceptional 
              customer experiences with our comprehensive automotive CRM platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="#demo"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Watch Demo
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Free 30-day trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Setup in 5 minutes
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">app.ghostautocrm.com</span>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sample Dashboard Cards */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Active Leads</h3>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">247</div>
                    <div className="text-sm text-green-600">+12% this month</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Sales Pipeline</h3>
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">$2.4M</div>
                    <div className="text-sm text-blue-600">85% close rate</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Follow-ups Due</h3>
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">18</div>
                    <div className="text-sm text-purple-600">Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Dominate Auto Sales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From lead capture to deal closing, our platform handles every aspect of your sales process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lead Management</h3>
              <p className="text-gray-600 mb-4">
                Capture, qualify, and convert leads with intelligent automation and personalized follow-ups.
              </p>
              <Link href="/features#lead-management" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Workflow className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h3>
              <p className="text-gray-600 mb-4">
                Automate repetitive tasks and create powerful workflows with our visual builder.
              </p>
              <Link href="/features#automation" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales Analytics</h3>
              <p className="text-gray-600 mb-4">
                Real-time insights and performance tracking to optimize your sales process.
              </p>
              <Link href="/features#analytics" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors inline-flex items-center"
            >
              View All Features
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Dealerships Worldwide
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of automotive professionals who have transformed their business with Ghost Auto CRM
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">2,500+</div>
              <div className="text-blue-200">Active Dealerships</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">40%</div>
              <div className="text-blue-200">Average Sales Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-200">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't take our word for it - hear from dealership owners and sales managers who have transformed their business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Ghost Auto CRM transformed our dealership. We've seen a 45% increase in sales and our team is more 
                organized than ever. The automation features save us hours every day."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Mitchell</div>
                  <div className="text-gray-500 text-sm">Sales Manager, Premier Auto</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "The AI assistant is incredible. It helps our team follow up with leads at the perfect time and provides 
                insights that we never had before. Game-changing technology!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike Johnson</div>
                  <div className="text-gray-500 text-sm">Owner, City Motors</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Implementation was seamless and the support team is outstanding. We were up and running in less than a 
                week and immediately saw improvements in our lead conversion."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  LR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Lisa Rodriguez</div>
                  <div className="text-gray-500 text-sm">Director, AutoMax Group</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful dealerships using Ghost Auto CRM. Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            30-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}

// Ensure this page is treated as a server component
export const runtime = 'nodejs';