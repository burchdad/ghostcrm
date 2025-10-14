"use client";
import React from 'react';
import Link from 'next/link';
import { categories } from './lib/categories';

export default function ChartMarketplacePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Choose Your Chart Category
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of chart templates organized by business function. 
          Each category contains specialized visualizations designed for specific use cases.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/dashboard/chart-marketplace/${category.id}`}
            className="group block"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group-hover:scale-105">
              {/* Category Header */}
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-2xl mr-4`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count ? `${category.count} charts` : 'Multiple charts'}
                  </p>
                </div>
              </div>

              {/* Category Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {category.description}
              </p>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                  Browse {category.name} Charts
                </span>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">25+</div>
            <div className="text-gray-600">Chart Templates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">6</div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">Customizable</div>
          </div>
        </div>
        <p className="mt-6 text-gray-600">
          All charts are fully customizable and integrate seamlessly with your dashboard data sources.
        </p>
      </div>
    </div>
  );
}