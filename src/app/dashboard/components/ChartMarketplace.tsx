"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'analytics' | 'finance' | 'operations' | 'custom';
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area' | 'radar';
  tags: string[];
  author: string;
  rating: number;
  downloads: number;
  preview: string; // Base64 or URL to preview image
  config: any; // Chart.js configuration
  dataStructure: {
    required: string[];
    optional: string[];
    sampleData: any;
  };
  aiPrompts: string[]; // Example prompts that would generate this chart
  complexity: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
  featured: boolean;
}

const defaultChartTemplates: ChartTemplate[] = [
  {
    id: 'sales-revenue-trend',
    name: 'Sales Revenue Trend',
    description: 'Track revenue trends over time with monthly, quarterly, or yearly breakdowns',
    category: 'sales',
    type: 'line',
    tags: ['revenue', 'trends', 'time-series', 'growth'],
    author: 'GhostCRM Team',
    rating: 4.8,
    downloads: 1547,
    preview: '📈',
    config: {
      type: 'line',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Revenue Trend Analysis' },
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (value: any) => '$' + value.toLocaleString() } }
        }
      }
    },
    dataStructure: {
      required: ['period', 'revenue'],
      optional: ['target', 'previousYear'],
      sampleData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [50000, 65000, 72000, 68000, 81000, 95000],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)'
        }]
      }
    },
    aiPrompts: [
      'Show sales revenue trends over time',
      'Create a revenue growth chart',
      'Display monthly sales performance',
      'Track quarterly revenue progress'
    ],
    complexity: 'beginner',
    lastUpdated: '2025-10-09',
    featured: true
  },
  {
    id: 'conversion-funnel',
    name: 'Conversion Funnel Analysis',
    description: 'Visualize lead conversion rates through your sales pipeline stages',
    category: 'sales',
    type: 'bar',
    tags: ['conversion', 'funnel', 'pipeline', 'leads'],
    author: 'GhostCRM Team',
    rating: 4.9,
    downloads: 2341,
    preview: '🎯',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Conversion Funnel' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    dataStructure: {
      required: ['stage', 'count'],
      optional: ['percentage', 'previous_period'],
      sampleData: {
        labels: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
        datasets: [{
          label: 'Count',
          data: [1000, 650, 420, 280, 150],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']
        }]
      }
    },
    aiPrompts: [
      'Show conversion funnel analysis',
      'Create a sales pipeline chart',
      'Display lead conversion rates',
      'Track funnel performance'
    ],
    complexity: 'intermediate',
    lastUpdated: '2025-10-08',
    featured: true
  },
  {
    id: 'team-performance',
    name: 'Team Performance Dashboard',
    description: 'Compare individual team member performance across key metrics',
    category: 'sales',
    type: 'radar',
    tags: ['team', 'performance', 'comparison', 'metrics'],
    author: 'GhostCRM Team',
    rating: 4.6,
    downloads: 987,
    preview: '🎪',
    config: {
      type: 'radar',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Team Performance Comparison' }
        },
        scales: {
          r: { beginAtZero: true, max: 100 }
        }
      }
    },
    dataStructure: {
      required: ['metric', 'score'],
      optional: ['target', 'department'],
      sampleData: {
        labels: ['Calls Made', 'Emails Sent', 'Deals Closed', 'Revenue Generated', 'Customer Satisfaction'],
        datasets: [{
          label: 'John Smith',
          data: [85, 92, 78, 88, 94],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)'
        }]
      }
    },
    aiPrompts: [
      'Compare team member performance',
      'Show sales rep comparison',
      'Create team performance radar',
      'Display individual metrics'
    ],
    complexity: 'advanced',
    lastUpdated: '2025-10-07',
    featured: false
  },
  {
    id: 'customer-segments',
    name: 'Customer Segmentation',
    description: 'Analyze customer distribution across different segments and categories',
    category: 'marketing',
    type: 'pie',
    tags: ['customers', 'segments', 'demographics', 'analysis'],
    author: 'Marketing Team',
    rating: 4.5,
    downloads: 1234,
    preview: '🥧',
    config: {
      type: 'pie',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Customer Segmentation' },
          legend: { position: 'right' }
        }
      }
    },
    dataStructure: {
      required: ['segment', 'count'],
      optional: ['value', 'growth_rate'],
      sampleData: {
        labels: ['Enterprise', 'Mid-Market', 'SMB', 'Startup'],
        datasets: [{
          data: [35, 28, 25, 12],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }]
      }
    },
    aiPrompts: [
      'Show customer segmentation',
      'Display customer distribution',
      'Create customer category chart',
      'Analyze customer segments'
    ],
    complexity: 'beginner',
    lastUpdated: '2025-10-06',
    featured: false
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status Overview',
    description: 'Monitor inventory levels, stock status, and reorder points',
    category: 'operations',
    type: 'doughnut',
    tags: ['inventory', 'stock', 'operations', 'alerts'],
    author: 'Operations Team',
    rating: 4.7,
    downloads: 876,
    preview: '📦',
    config: {
      type: 'doughnut',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Inventory Status' },
          legend: { position: 'bottom' }
        }
      }
    },
    dataStructure: {
      required: ['status', 'count'],
      optional: ['value', 'threshold'],
      sampleData: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Ordered'],
        datasets: [{
          data: [65, 15, 8, 12],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#6366f1']
        }]
      }
    },
    aiPrompts: [
      'Show inventory status',
      'Display stock levels',
      'Create inventory overview',
      'Monitor stock alerts'
    ],
    complexity: 'beginner',
    lastUpdated: '2025-10-05',
    featured: false
  }
];

interface ChartMarketplaceProps {
  onSelectChart: (template: ChartTemplate) => void;
  onInstallChart: (template: ChartTemplate) => void;
  currentCategory?: string;
}

export default function ChartMarketplace({ onSelectChart, onInstallChart, currentCategory }: ChartMarketplaceProps) {
  const [charts, setCharts] = useState<ChartTemplate[]>(defaultChartTemplates);
  const [filteredCharts, setFilteredCharts] = useState<ChartTemplate[]>(defaultChartTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'recent'>('rating');
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const { show: showToast } = useToast();

  // Load charts from marketplace API
  useEffect(() => {
    loadMarketplaceCharts();
  }, []);

  // Filter and sort charts
  useEffect(() => {
    let filtered = [...charts];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(chart => chart.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chart => 
        chart.name.toLowerCase().includes(query) ||
        chart.description.toLowerCase().includes(query) ||
        chart.tags.some(tag => tag.toLowerCase().includes(query)) ||
        chart.aiPrompts.some(prompt => prompt.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    setFilteredCharts(filtered);
  }, [charts, selectedCategory, searchQuery, sortBy]);

  const loadMarketplaceCharts = async () => {
    try {
      const response = await fetch('/api/dashboard/marketplace');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.charts) {
          // Merge with default templates
          setCharts([...defaultChartTemplates, ...data.charts]);
        }
      }
    } catch (error) {
      console.error('Failed to load marketplace charts:', error);
    }
  };

  const handleInstallChart = async (template: ChartTemplate) => {
    try {
      await onInstallChart(template);
      showToast(`Successfully installed "${template.name}"`, 'success');
    } catch (error) {
      showToast(`Failed to install chart: ${error}`, 'error');
    }
  };

  const categories = [
    { id: 'all', name: 'All Charts', icon: '📊' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'analytics', name: 'Analytics', icon: '🔍' },
    { id: 'finance', name: 'Finance', icon: '💵' },
    { id: 'operations', name: 'Operations', icon: '⚙️' },
    { id: 'custom', name: 'Custom', icon: '🎨' }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          Chart Marketplace
        </h2>
        <p className="text-gray-600 text-sm">Browse and install charts to enhance your dashboard</p>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search charts, tags, or AI prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="rating">⭐ Rating</option>
            <option value="downloads">⬇️ Downloads</option>
            <option value="recent">🕒 Recent</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharts.map(chart => (
            <div key={chart.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white">
              {/* Chart preview */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{chart.preview}</div>
                {chart.featured && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">⭐ Featured</span>
                )}
              </div>

              {/* Chart info */}
              <h3 className="font-semibold text-gray-800 mb-1">{chart.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{chart.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {chart.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
                {chart.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{chart.tags.length - 3} more</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>⭐ {chart.rating}</span>
                <span>⬇️ {chart.downloads.toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded ${getComplexityColor(chart.complexity)}`}>
                  {chart.complexity}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectChart(chart)}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  📊 Preview
                </button>
                <button
                  onClick={() => handleInstallChart(chart)}
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  ⬇️ Install
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCharts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <div>No charts found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
}