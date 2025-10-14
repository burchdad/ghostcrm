"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from './lib/categories';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

export default function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  const pathname = usePathname();
  const currentCategory = pathname.split('/').pop();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-4">
            <nav className="flex text-sm text-gray-500">
              <Link href="/dashboard" className="hover:text-gray-700">
                Dashboard
              </Link>
              <span className="mx-2">/</span>
              <Link href="/dashboard/chart-marketplace" className="hover:text-gray-700">
                Chart Marketplace
              </Link>
              {currentCategory && currentCategory !== 'chart-marketplace' && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium capitalize">
                    {currentCategory}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Main Header */}
          <div className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-4xl">🏪</span>
                  Chart Marketplace
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Discover and install powerful charts to enhance your dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="pb-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/chart-marketplace"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/dashboard/chart-marketplace'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 All Categories
              </Link>
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/dashboard/chart-marketplace/${category.id}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}