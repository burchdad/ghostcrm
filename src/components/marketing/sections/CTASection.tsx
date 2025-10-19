import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
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
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center group"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
  );
}