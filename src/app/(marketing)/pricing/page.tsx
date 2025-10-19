import React from "react";
import Link from "next/link";
import { 
  Check, Zap, Star, ArrowRight, Users, Shield, Phone, Mail,
  Calendar, BarChart3, Database, Globe, MessageCircle, Target
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small dealerships getting started",
    price: 49,
    period: "per user/month",
    popular: false,
    features: [
      "Up to 5 users",
      "1,000 leads per month", 
      "Basic CRM features",
      "Email support",
      "Lead capture forms",
      "Basic reporting",
      "Mobile apps",
      "API access"
    ],
    limitations: [
      "Limited automations",
      "Basic integrations only"
    ]
  },
  {
    name: "Professional", 
    description: "For growing dealerships that need more power",
    price: 99,
    period: "per user/month", 
    popular: true,
    features: [
      "Up to 25 users",
      "10,000 leads per month",
      "Advanced CRM features", 
      "Priority support",
      "Advanced automations",
      "Custom workflows",
      "Advanced reporting",
      "Inventory management",
      "All integrations",
      "Phone support",
      "Custom fields",
      "Sales pipeline"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    description: "For large dealerships and dealer groups", 
    price: 199,
    period: "per user/month",
    popular: false,
    features: [
      "Unlimited users",
      "Unlimited leads", 
      "All CRM features",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label options",
      "Advanced security",
      "Custom onboarding",
      "Dedicated account manager",
      "SLA guarantees",
      "Advanced analytics",
      "Multi-location support",
      "Custom training",
      "Priority feature requests"
    ],
    limitations: []
  }
];

const addOns = [
  {
    name: "AI Assistant Premium",
    price: 29,
    description: "Advanced AI features with GPT-4 integration",
    features: [
      "Unlimited AI queries",
      "Custom AI prompts", 
      "Lead scoring AI",
      "Predictive analytics"
    ]
  },
  {
    name: "Advanced Telephony",
    price: 19,
    description: "Professional phone system integration",
    features: [
      "Auto-dialer",
      "Call recording", 
      "SMS campaigns",
      "Voice analytics"
    ]
  },
  {
    name: "Marketing Automation",
    price: 39,
    description: "Advanced email and social media marketing",
    features: [
      "Email campaigns",
      "Social media posting",
      "Landing page builder", 
      "A/B testing"
    ]
  }
];

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees ever. We believe in transparent pricing with no hidden costs."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers for annual plans."
  },
  {
    question: "Is there a long-term contract required?", 
    answer: "No contracts required. All plans are month-to-month and you can cancel at any time."
  },
  {
    question: "Do you offer discounts for annual payments?",
    answer: "Yes! Save 20% when you pay annually. Contact our sales team for custom enterprise pricing."
  },
  {
    question: "What kind of support is included?",
    answer: "All plans include email support. Professional and Enterprise plans include phone support and priority assistance."
  }
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your dealership. All plans include a 30-day free trial, 
              no setup fees, and you can cancel anytime.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-gray-600">Monthly</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                <div className="dot absolute w-4 h-4 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
              </div>
              <span className="text-gray-600">
                Annual 
                <span className="ml-1 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl scale-105' 
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <Link
                    href="/login"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors inline-block ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start">
                            <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5">•</span>
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Add-ons
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Supercharge your CRM with these optional add-ons available for any plan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{addon.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">${addon.price}</span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>
                  <p className="text-gray-600 text-sm">{addon.description}</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {addon.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                  Add to Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-gray-600">
              See what's included in each plan at a glance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-blue-50">
                    Professional
                    <div className="text-xs text-blue-600 font-normal">Most Popular</div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="py-4 px-6 font-medium">Users</td>
                  <td className="py-4 px-6 text-center">Up to 5</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Up to 25</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="py-4 px-6 font-medium">Monthly Leads</td>
                  <td className="py-4 px-6 text-center">1,000</td>
                  <td className="py-4 px-6 text-center bg-blue-50">10,000</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="py-4 px-6 font-medium">Automation Workflows</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Advanced</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="py-4 px-6 font-medium">Support</td>
                  <td className="py-4 px-6 text-center">Email</td>
                  <td className="py-4 px-6 text-center bg-blue-50">Phone + Email</td>
                  <td className="py-4 px-6 text-center">24/7 Dedicated</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="py-4 px-6 font-medium">API Access</td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your 30-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Sales
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            Questions? Call us at 1-800-GHOST-CRM or email sales@ghostautocrm.com
          </p>
        </div>
      </section>
    </div>
  );
}

// Ensure this page is treated as a server component
export const runtime = 'nodejs';