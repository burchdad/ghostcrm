import { Check, Zap, Star, ArrowRight, Users, Car, Shield } from "lucide-react";
import Link from "next/link";

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
      "Mobile app access",
      "Lead capture forms",
      "Basic reporting",
      "Customer database"
    ],
    limitations: [
      "Limited integrations",
      "Basic automation",
      "Standard templates"
    ]
  },
  {
    name: "Professional",
    description: "Most popular for growing dealerships",
    price: 99,
    period: "per user/month",
    popular: true,
    features: [
      "Up to 25 users",
      "10,000 leads per month",
      "Advanced CRM features",
      "Priority support",
      "Mobile app access",
      "Advanced lead scoring",
      "Custom workflows", 
      "Advanced analytics",
      "API access",
      "Third-party integrations",
      "Custom fields",
      "Team collaboration tools"
    ],
    limitations: [
      "Advanced AI features extra",
      "Premium integrations extra"
    ]
  },
  {
    name: "Enterprise",
    description: "For large dealership groups and franchises",
    price: "Custom",
    period: "contact sales",
    popular: false,
    features: [
      "Unlimited users",
      "Unlimited leads",
      "All CRM features",
      "24/7 dedicated support",
      "White-label options",
      "Advanced AI & automation",
      "Custom integrations",
      "Advanced security",
      "Dedicated account manager",
      "Custom training",
      "SLA guarantee",
      "Multi-location management",
      "Advanced compliance",
      "Custom reporting"
    ],
    limitations: []
  }
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "Our 14-day free trial includes full access to all Professional plan features with up to 5 users. No credit card required to start."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle, and we'll prorate any differences."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for any plan. We also include free onboarding and data migration assistance for Professional and Enterprise plans."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH transfers, and can accommodate annual billing with invoicing for Enterprise customers."
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Save 20% when you pay annually. Enterprise customers can discuss custom billing arrangements with our sales team."
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "You can export all your data at any time. After cancellation, we securely retain your data for 90 days in case you decide to reactivate."
  }
];

export default function PricingPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your dealership. All plans include our core CRM features, 
            mobile access, and dedicated support. Start your free trial today.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-blue-600 text-white border-2 border-blue-600 relative"
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold ${plan.popular ? "text-white" : "text-gray-900"} mb-2`}>
                    {plan.name}
                  </h3>
                  <p className={`${plan.popular ? "text-blue-100" : "text-gray-600"} mb-6`}>
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    {typeof plan.price === "number" ? (
                      <>
                        <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                          ${plan.price}
                        </span>
                        <span className={`${plan.popular ? "text-blue-200" : "text-gray-600"} ml-2`}>
                          {plan.period}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                          {plan.price}
                        </span>
                        <span className={`${plan.popular ? "text-blue-200" : "text-gray-600"} ml-2 block text-base`}>
                          {plan.period}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <Link
                    href={plan.name === "Enterprise" ? "/" : "/login"}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors inline-flex items-center justify-center ${
                      plan.popular
                        ? "bg-white text-blue-600 hover:bg-gray-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                <div className="space-y-4">
                  <h4 className={`font-semibold ${plan.popular ? "text-blue-100" : "text-gray-700"} mb-3`}>
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className={`w-5 h-5 ${plan.popular ? "text-blue-200" : "text-green-500"} mr-3 mt-0.5 flex-shrink-0`} />
                        <span className={`${plan.popular ? "text-blue-50" : "text-gray-600"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See exactly what's included in each plan to choose the best fit for your dealership.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Professional</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: "Users", starter: "Up to 5", professional: "Up to 25", enterprise: "Unlimited" },
                    { feature: "Leads per month", starter: "1,000", professional: "10,000", enterprise: "Unlimited" },
                    { feature: "Lead scoring", starter: "Basic", professional: "Advanced", enterprise: "AI-powered" },
                    { feature: "Workflows", starter: "Templates", professional: "Custom", enterprise: "Advanced + AI" },
                    { feature: "Integrations", starter: "5", professional: "25+", enterprise: "Unlimited" },
                    { feature: "API access", starter: "❌", professional: "✅", enterprise: "✅" },
                    { feature: "White-label", starter: "❌", professional: "❌", enterprise: "✅" },
                    { feature: "Support", starter: "Email", professional: "Priority", enterprise: "24/7 Dedicated" }
                  ].map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.starter}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.professional}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We have answers.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 p-8 bg-blue-50 rounded-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you choose the right plan for your dealership.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center"
            >
              Contact Sales Team
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join 10,000+ Automotive Professionals
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see why dealerships across the country choose Ghost Auto CRM 
            to grow their business.
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold inline-flex items-center text-lg"
          >
            Start Your Free Trial
            <Zap className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}