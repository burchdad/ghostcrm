import React from "react";
import Link from "next/link";
import { 
  Users, Target, Calendar, MessageCircle, BarChart3, Zap, Globe, Shield, 
  CreditCard, Workflow, Database, Phone, Mail, CheckCircle, ArrowRight,
  Brain, Clock, TrendingUp, FileText, Settings, Monitor, Smartphone, Award
} from "lucide-react";

const features = [
  {
    category: "Lead Management",
    icon: <Target className="w-8 h-8" />,
    items: [
      {
        title: "Intelligent Lead Capture",
        description: "Automatically capture leads from your website, social media, and third-party platforms.",
        icon: <Users className="w-6 h-6" />
      },
      {
        title: "Lead Scoring & Qualification", 
        description: "AI-powered lead scoring to prioritize your hottest prospects.",
        icon: <Brain className="w-6 h-6" />
      },
      {
        title: "Smart Follow-up Sequences",
        description: "Automated email and SMS campaigns tailored to each lead's behavior.",
        icon: <MessageCircle className="w-6 h-6" />
      },
      {
        title: "Lead Source Tracking",
        description: "Track which marketing channels generate your best leads.",
        icon: <BarChart3 className="w-6 h-6" />
      }
    ]
  },
  {
    category: "Sales Pipeline",
    icon: <TrendingUp className="w-8 h-8" />,
    items: [
      {
        title: "Visual Sales Pipeline",
        description: "Drag-and-drop pipeline management with customizable stages.",
        icon: <Monitor className="w-6 h-6" />
      },
      {
        title: "Deal Tracking",
        description: "Monitor deal progress, probability, and expected close dates.",
        icon: <FileText className="w-6 h-6" />
      },
      {
        title: "Sales Forecasting",
        description: "Predict revenue with AI-powered sales forecasting.",
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        title: "Performance Analytics", 
        description: "Track team performance with detailed analytics and reporting.",
        icon: <Award className="w-6 h-6" />
      }
    ]
  },
  {
    category: "Customer Management",
    icon: <Users className="w-8 h-8" />,
    items: [
      {
        title: "360° Customer View",
        description: "Complete customer history, preferences, and interaction timeline.",
        icon: <Users className="w-6 h-6" />
      },
      {
        title: "Communication Hub",
        description: "Centralized email, SMS, and call logging with automated responses.",
        icon: <MessageCircle className="w-6 h-6" />
      },
      {
        title: "Appointment Scheduling",
        description: "Integrated calendar with automated reminders and confirmations.",
        icon: <Calendar className="w-6 h-6" />
      },
      {
        title: "Document Management",
        description: "Store and share contracts, documents, and digital signatures.",
        icon: <FileText className="w-6 h-6" />
      }
    ]
  },
  {
    category: "Automation & AI",
    icon: <Zap className="w-8 h-8" />,
    items: [
      {
        title: "Workflow Automation",
        description: "67+ automation nodes to eliminate repetitive tasks.",
        icon: <Workflow className="w-6 h-6" />
      },
      {
        title: "AI Sales Assistant",
        description: "Get instant insights and recommendations powered by OpenAI.",
        icon: <Brain className="w-6 h-6" />
      },
      {
        title: "Smart Notifications",
        description: "Intelligent alerts for follow-ups, tasks, and opportunities.",
        icon: <Clock className="w-6 h-6" />
      },
      {
        title: "Custom Code Execution",
        description: "Run custom JavaScript code within your automation workflows.",
        icon: <Settings className="w-6 h-6" />
      }
    ]
  },
  {
    category: "Inventory Management",
    icon: <Database className="w-8 h-8" />,
    items: [
      {
        title: "Vehicle Inventory Tracking",
        description: "Real-time inventory management with detailed vehicle information.",
        icon: <Database className="w-6 h-6" />
      },
      {
        title: "Pricing Optimization",
        description: "AI-powered pricing suggestions based on market data.",
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        title: "Automated Alerts",
        description: "Get notified about aging inventory, price changes, and more.",
        icon: <Clock className="w-6 h-6" />
      },
      {
        title: "Multi-location Support",
        description: "Manage inventory across multiple dealership locations.",
        icon: <Globe className="w-6 h-6" />
      }
    ]
  },
  {
    category: "Integrations & Security",
    icon: <Shield className="w-8 h-8" />,
    items: [
      {
        title: "200+ Integrations",
        description: "Connect with popular tools like Mailchimp, Zapier, and more.",
        icon: <Globe className="w-6 h-6" />
      },
      {
        title: "API Access",
        description: "Full REST API for custom integrations and data sync.",
        icon: <Settings className="w-6 h-6" />
      },
      {
        title: "Enterprise Security",
        description: "Bank-level security with encryption and compliance.",
        icon: <Shield className="w-6 h-6" />
      },
      {
        title: "Mobile Apps",
        description: "Native iOS and Android apps for on-the-go access.",
        icon: <Smartphone className="w-6 h-6" />
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Modern Dealerships
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Everything you need to streamline operations, boost sales, and deliver exceptional customer experiences. 
              Built specifically for automotive professionals.
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
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className={categoryIndex > 0 ? "mt-24" : ""}>
              {/* Category Header */}
              <div className="text-center mb-16">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {category.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.items.map((feature, featureIndex) => (
                  <div key={featureIndex} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Ghost Auto CRM?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built by automotive professionals, for automotive professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-blue-100">Built on modern technology for speed and reliability</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Friendly</h3>
              <p className="text-blue-100">Intuitive interface that your team will love using</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable</h3>
              <p className="text-blue-100">Grows with your business from startup to enterprise</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-blue-100">Enterprise-grade security and data protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to See These Features in Action?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your free trial today and discover how Ghost Auto CRM can transform your dealership operations.
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
              View Pricing Plans
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            30-day free trial • No credit card required • Setup in under 5 minutes
          </p>
        </div>
      </section>
    </div>
  );
}

// Ensure this page is treated as a server component
export const runtime = 'nodejs';