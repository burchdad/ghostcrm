import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ghost Auto CRM - Transform Your Automotive Sales</title>
        <meta name="description" content="The ultimate CRM solution for automotive dealerships. Streamline operations, boost sales, and deliver exceptional customer experiences." />
      </head>
      <body>
        <div className="min-h-screen bg-white">
          {/* Simple static header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
                  <span className="text-xl font-bold text-gray-900">Ghost Auto CRM</span>
                </div>
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="/features" className="text-gray-600 hover:text-gray-900">Features</a>
                  <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                  <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
                  <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Sign In
                  </a>
                </nav>
              </div>
            </div>
          </header>

          <main className="min-h-screen">
            {children}
          </main>

          {/* Simple static footer */}
          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
                    <span className="text-xl font-bold">Ghost Auto CRM</span>
                  </div>
                  <p className="text-gray-400">
                    The ultimate CRM solution for automotive dealerships.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2">
                    <li><a href="/features" className="text-gray-400 hover:text-white">Features</a></li>
                    <li><a href="/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                    <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                    <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                    <li><a href="/careers" className="text-gray-400 hover:text-white">Careers</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li><a href="/help" className="text-gray-400 hover:text-white">Help Center</a></li>
                    <li><a href="/docs" className="text-gray-400 hover:text-white">Documentation</a></li>
                    <li><a href="/status" className="text-gray-400 hover:text-white">Status</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400">
                  © 2025 Ghost Auto CRM. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

// Force this to be a static layout
export const dynamic = 'force-static';
export const runtime = 'nodejs';