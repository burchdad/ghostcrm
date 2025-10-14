import { ChartTemplate } from '../../lib/types';

export const salesCharts: ChartTemplate[] = [
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
    id: 'sales-by-region',
    name: 'Sales by Region',
    description: 'Geographic breakdown of sales performance across different regions',
    category: 'sales',
    type: 'pie',
    tags: ['regional', 'geographic', 'territory', 'distribution'],
    author: 'GhostCRM Team',
    rating: 4.7,
    downloads: 892,
    preview: '🌍',
    config: {
      type: 'pie',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Sales Distribution by Region' },
          legend: { position: 'right' }
        }
      }
    },
    dataStructure: {
      required: ['region', 'sales'],
      optional: ['target', 'growth'],
      sampleData: {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
        datasets: [{
          data: [45, 25, 20, 7, 3],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        }]
      }
    },
    aiPrompts: [
      'Show sales by region',
      'Display geographic sales distribution',
      'Create regional performance chart',
      'Analyze territory sales'
    ],
    complexity: 'beginner',
    lastUpdated: '2025-10-05',
    featured: false
  }
];