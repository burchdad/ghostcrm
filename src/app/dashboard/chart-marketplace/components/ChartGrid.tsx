"use client";
import React, { useState } from 'react';
import { ChartTemplate } from '../lib/types';
import ChartCard from './ChartCard';

interface ChartGridProps {
  charts: ChartTemplate[];
  onInstall: (chart: ChartTemplate) => void;
  showCategory?: boolean;
  title?: string;
  description?: string;
}

export default function ChartGrid({ 
  charts, 
  onInstall, 
  showCategory = false, 
  title, 
  description 
}: ChartGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'featured'>('featured');

  // Filter charts based on search
  const filteredCharts = charts.filter(chart => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      chart.name.toLowerCase().includes(query) ||
      chart.description.toLowerCase().includes(query) ||
      chart.tags.some(tag => tag.toLowerCase().includes(query)) ||
      chart.aiPrompts.some(prompt => prompt.toLowerCase().includes(query))
    );
  });

  // Sort charts
  const sortedCharts = [...filteredCharts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      {(title || description) && (
        <div className="text-center">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search charts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="featured">Featured First</option>
            <option value="name">Name</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedCharts.length} of {charts.length} charts
      </div>

      {/* Charts Grid */}
      {sortedCharts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCharts.map(chart => (
            <ChartCard
              key={chart.id}
              chart={chart}
              onInstall={onInstall}
              showCategory={showCategory}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No charts found</h3>
          <p className="text-gray-600">
            {searchQuery.trim() 
              ? "Try adjusting your search terms" 
              : "No charts available in this category yet"
            }
          </p>
        </div>
      )}
    </div>
  );
}