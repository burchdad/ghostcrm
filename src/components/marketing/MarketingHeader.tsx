"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Car, Menu, X, Phone, Mail } from "lucide-react";
import ContactSalesModal from "@/components/ContactSalesModal";

export default function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Ghost Auto CRM</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <button
                onClick={() => setShowContactSales(true)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact Sales
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  About
                </Link>
                <button
                  onClick={() => setShowContactSales(true)}
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Contact Sales
                </button>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={showContactSales}
        onClose={() => setShowContactSales(false)}
      />
    </>
  );
}