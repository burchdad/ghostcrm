import { Car, Users, Target, Calendar, MessageCircle, BarChart3, Zap, Globe, Shield, CreditCard } from "lucide-react";
import Link from "next/link";

const features = [
  {
    category: "Lead Management",
    icon: <Target className="w-8 h-8" />,
    items: [
      {
        title: "Intelligent Lead Capture",
        description: "Automatically capture leads from website forms, social media, and third-party platforms with smart lead scoring.",
        features: ["Real-time lead scoring", "Multi-channel capture", "Duplicate detection", "Lead source tracking"]
      },
      {
        title: "Lead Qualification",
        description: "Use AI-powered qualification to identify hot prospects and prioritize your sales efforts effectively.",
        features: ["Automated qualification", "Behavioral tracking", "Interest scoring", "Custom qualification rules"]
      },
      {
        title: "Lead Nurturing",
        description: "Create automated nurturing campaigns that guide prospects through your sales funnel.",
        features: ["Drip campaigns", "Personalized messaging", "Follow-up automation", "Engagement tracking"]
      }
    ]
  },
  {
    category: "Sales Management",
    icon: <BarChart3 className="w-8 h-8" />,
    items: [
      {
        title: "Deal Pipeline Management",
        description: "Visualize and manage your sales pipeline with customizable stages and automated progression.",
        features: ["Visual pipeline", "Custom deal stages", "Automated stage progression", "Deal forecasting"]
      },
      {
        title: "Sales Performance Analytics",
        description: "Track individual and team performance with comprehensive sales analytics and reporting.",
        features: ["Performance dashboards", "Sales forecasting", "Activity tracking", "Commission calculation"]
      },
      {
        title: "Quote & Proposal Management",
        description: "Generate professional quotes and proposals quickly with integrated pricing and inventory.",
        features: ["Dynamic pricing", "Proposal templates", "E-signature integration", "Quote versioning"]
      }
    ]
  },
  {
    category: "Customer Communication",
    icon: <MessageCircle className="w-8 h-8" />,
    items: [
      {
        title: "Multi-Channel Communication",
        description: "Manage all customer communications from a single interface across email, SMS, and phone.",
        features: ["Unified inbox", "SMS integration", "Call logging", "Email templates"]
      },
      {
        title: "Automated Follow-ups",
        description: "Never miss a follow-up with intelligent automation that keeps prospects engaged.",
        features: ["Scheduled follow-ups", "Trigger-based messaging", "Personalized content", "Response tracking"]
      },
      {
        title: "Customer Journey Mapping",
        description: "Track and optimize every touchpoint in your customer's journey from lead to sale.",
        features: ["Journey visualization", "Touchpoint tracking", "Conversion analysis", "Experience optimization"]
      }
    ]
  },
  {
    category: "Workflow Automation",
    icon: <Zap className="w-8 h-8" />,
    items: [
      {
        title: "Custom Workflow Builder",
        description: "Build complex automation workflows with our visual drag-and-drop workflow designer.",
        features: ["Visual workflow builder", "Conditional logic", "Multi-step automation", "Custom triggers"]
      },
      {
        title: "Task Automation",
        description: "Automate repetitive tasks and focus on what matters most - selling and building relationships.",
        features: ["Task assignment", "Deadline management", "Progress tracking", "Team collaboration"]
      },
      {
        title: "Integration Automation",
        description: "Connect with your existing tools and automate data flow between systems seamlessly.",
        features: ["API integrations", "Data synchronization", "Real-time updates", "Custom connectors"]
      }
    ]
  },
  {
    category: "Analytics & Reporting",
    icon: <BarChart3 className="w-8 h-8" />,
    items: [
      {
        title: "Sales Analytics Dashboard",
        description: "Get real-time insights into your sales performance with comprehensive analytics dashboards.",
        features: ["Real-time dashboards", "Custom metrics", "Trend analysis", "Performance comparisons"]
      },
      {
        title: "Customer Analytics",
        description: "Understand customer behavior and preferences with detailed customer analytics and insights.",
        features: ["Customer segmentation", "Behavior analysis", "Lifetime value", "Churn prediction"]
      },
      {
        title: "ROI & Performance Tracking",
        description: "Measure the return on investment of your sales and marketing efforts with detailed tracking.",
        features: ["ROI calculation", "Campaign tracking", "Performance metrics", "Cost analysis"]
      }
    ]
  },
  {
    category: "Integrations & Security",
    icon: <Shield className="w-8 h-8" />,
    items: [
      {
        title: "Third-Party Integrations",
        description: "Connect with popular tools and platforms to create a seamless workflow ecosystem.",
        features: ["Popular integrations", "API access", "Webhook support", "Data synchronization"]
      },
      {
        title: "Enterprise Security",
        description: "Bank-level security with encryption, compliance, and access controls to protect your data.",
        features: ["Data encryption", "GDPR compliance", "Role-based access", "Audit trails"]
      },
      {
        title: "Mobile & Cloud Access",
        description: "Access your CRM from anywhere with our mobile apps and cloud-based architecture.",
        features: ["Mobile apps", "Cloud sync", "Offline access", "Cross-device sync"]
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Car className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Powerful Features for
              <span className="block text-blue-600 mt-2">Automotive Success</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how Ghost Auto CRM transforms your dealership operations with intelligent automation, 
            comprehensive analytics, and seamless integrations designed specifically for the automotive industry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center justify-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold inline-flex items-center justify-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {features.map((category, categoryIndex) => (
              <div key={category.category}>
                {/* Category Header */}
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-blue-100 rounded-2xl p-4 text-blue-600">
                      {category.icon}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {category.category}
                  </h2>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {category.items.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamlessly Integrate with Your Existing Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect Ghost Auto CRM with the tools you already use to create a unified business ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Salesforce", logo: "💼" },
              { name: "Google Workspace", logo: "🔍" },
              { name: "Microsoft 365", logo: "📊" },
              { name: "QuickBooks", logo: "💰" },
              { name: "Mailchimp", logo: "📧" },
              { name: "Slack", logo: "💬" },
              { name: "Zoom", logo: "📹" },
              { name: "DocuSign", logo: "✍️" },
              { name: "HubSpot", logo: "🔗" },
              { name: "Zapier", logo: "⚡" },
              { name: "Twilio", logo: "📱" },
              { name: "Stripe", logo: "💳" }
            ].map((integration) => (
              <div
                key={integration.name}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{integration.logo}</div>
                <p className="text-sm font-medium text-gray-900">{integration.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of automotive professionals who have already revolutionized their sales process with Ghost Auto CRM.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold inline-flex items-center justify-center"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/"
              className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold inline-flex items-center justify-center"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}