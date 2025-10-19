import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Car, Users, Target, Award, Globe, Shield,
  Heart, Zap, TrendingUp, Calendar, CheckCircle, Star
} from "lucide-react";

const team = [
  {
    name: "Alex Johnson",
    role: "CEO & Founder", 
    image: "/api/placeholder/150/150",
    bio: "Former automotive sales director with 15+ years of experience. Built Ghost CRM after seeing dealerships struggle with outdated systems.",
    initials: "AJ"
  },
  {
    name: "Sarah Chen", 
    role: "CTO & Co-Founder",
    image: "/api/placeholder/150/150", 
    bio: "Software architect who led CRM development at Fortune 500 companies. Expert in scalable SaaS platforms.",
    initials: "SC"
  },
  {
    name: "Mike Rodriguez",
    role: "VP of Sales",
    image: "/api/placeholder/150/150",
    bio: "20+ years in automotive industry. Helps dealerships maximize their CRM investment and grow revenue.",
    initials: "MR"
  },
  {
    name: "Lisa Thompson",
    role: "Head of Customer Success", 
    image: "/api/placeholder/150/150",
    bio: "Dedicated to ensuring every customer achieves their goals with Ghost CRM. Former dealership operations manager.",
    initials: "LT"
  }
];

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Customer First",
    description: "Every decision we make is guided by what's best for our customers and their success."
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Innovation",
    description: "We're constantly pushing the boundaries of what's possible in automotive CRM technology."
  },
  {
    icon: <Shield className="w-8 h-8" />, 
    title: "Trust & Security",
    description: "Your data is sacred. We maintain the highest standards of security and privacy."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Partnership",
    description: "We're not just a vendor - we're your technology partner invested in your long-term success."
  }
];

const milestones = [
  {
    year: "2020",
    title: "Company Founded",
    description: "Started by automotive industry veterans frustrated with existing CRM solutions."
  },
  {
    year: "2021", 
    title: "First 100 Customers",
    description: "Reached our first milestone with dealerships across North America."
  },
  {
    year: "2022",
    title: "AI Integration",
    description: "Launched industry-first AI-powered sales assistant and automation features."
  },
  {
    year: "2023",
    title: "1,000+ Dealerships",
    description: "Crossed 1,000 active dealerships and $1B in managed sales pipeline."
  },
  {
    year: "2024",
    title: "International Expansion", 
    description: "Expanded to serve dealerships in Canada, UK, and Australia."
  },
  {
    year: "2025",
    title: "Market Leader",
    description: "Became the #1 rated automotive CRM with 2,500+ dealerships worldwide."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Built by Dealers, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}for Dealers
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We understand the automotive industry because we've lived it. Ghost Auto CRM was created 
              by industry veterans who know exactly what dealerships need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="#story"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-gray-600">Active Dealerships</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">$5B+</div>
              <div className="text-gray-600">Sales Managed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why We Built Ghost CRM
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  After spending decades in automotive sales and operations, our founders were frustrated 
                  by the lack of truly effective CRM solutions built specifically for dealerships.
                </p>
                <p>
                  Most CRMs were either too generic, too complicated, or missing critical features that 
                  automotive professionals actually need. We decided to change that.
                </p>
                <p>
                  Ghost Auto CRM was built from the ground up with input from hundreds of dealers, 
                  sales managers, and automotive professionals. Every feature has been tested in 
                  real dealerships with real customers.
                </p>
                <p>
                  Today, we're proud to serve over 2,500 dealerships worldwide, helping them increase 
                  sales by an average of 40% while dramatically improving their operational efficiency.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  To empower every automotive dealership with technology that drives real results, 
                  not just features. We believe great software should make your job easier, not harder.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Industry-specific
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Results-driven
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to transform automotive CRM
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="relative z-10 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automotive and technology experts dedicated to your success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-semibold">
                  {member.initials}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Industry Recognition
            </h2>
            <p className="text-xl text-blue-100">
              Trusted and recognized by industry leaders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">#1 Automotive CRM</h3>
              <p className="text-blue-100">Rated #1 by Auto Industry Review 2024</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Customer Support</h3>
              <p className="text-blue-100">Software Excellence Awards 2024</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fastest Growing</h3>
              <p className="text-blue-100">CRM Platform 2023-2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Join Our Success Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of dealerships who have transformed their business with Ghost Auto CRM. 
            Start your free trial today.
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
              View Plans
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Questions? Contact us at hello@ghostautocrm.com or 1-800-GHOST-CRM
          </p>
        </div>
      </section>
    </div>
  );
}