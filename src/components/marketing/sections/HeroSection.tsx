import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, BarChart3, Calendar } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Automotive Sales
          </span>
          <div className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
            Streamline your dealership operations, boost sales by 40%, and deliver exceptional customer experiences with Ghost Auto CRM.
          </div>
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 mt-8">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <a
            href="#demo"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Watch Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            30-day free trial
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            No setup fees
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Cancel anytime
          </div>
        </div>
      </div>

      {/* Interactive Dashboard Preview */}
      <div className="mt-20 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400 text-sm ml-4">app.ghostautocrm.com</span>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Active Leads</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">247</div>
                <div className="text-sm text-green-600">+12% this month</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sales Pipeline</h3>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$2.4M</div>
                <div className="text-sm text-blue-600">85% close rate</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
    </section>
  );
}