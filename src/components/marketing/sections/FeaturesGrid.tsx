import React from "react";
import Link from "next/link";
import { ArrowRight, Users, Workflow, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    bgColor: "bg-blue-100",
    hoverColor: "group-hover:bg-blue-200",
    title: "Lead Management",
    description: "Capture, qualify, and convert leads with intelligent automation and personalized follow-ups.",
    link: "/features#lead-management"
  },
  {
    icon: <Workflow className="w-6 h-6 text-purple-600" />,
    bgColor: "bg-purple-100", 
    hoverColor: "group-hover:bg-purple-200",
    title: "Workflow Automation",
    description: "Automate repetitive tasks and create powerful workflows with our visual builder.",
    link: "/features#automation"
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-green-600" />,
    bgColor: "bg-green-100",
    hoverColor: "group-hover:bg-green-200", 
    title: "Sales Analytics",
    description: "Real-time insights and performance tracking to optimize your sales process.",
    link: "/features#analytics"
  }
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Dominate Auto Sales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From lead capture to deal closing, our platform handles every aspect of your sales process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 ${feature.hoverColor} transition-colors`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <Link href={feature.link} className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>
          ))}
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
  );
}