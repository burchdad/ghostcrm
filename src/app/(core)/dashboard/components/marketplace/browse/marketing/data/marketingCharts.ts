import { ChartTemplate } from '../../lib/types';

export const marketingCharts: ChartTemplate[] = [
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
    featured: true
  },
  {
    id: 'campaign-performance',
    name: 'Campaign Performance Tracker',
    description: 'Monitor marketing campaign effectiveness across multiple channels',
    category: 'marketing',
    type: 'bar',
    tags: ['campaigns', 'roi', 'channels', 'performance'],
    author: 'Marketing Team',
    rating: 4.8,
    downloads: 1567,
    preview: '📊',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Campaign Performance Comparison' },
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    dataStructure: {
      required: ['campaign', 'impressions', 'clicks', 'conversions'],
      optional: ['cost', 'revenue'],
      sampleData: {
        labels: ['Email Campaign', 'Social Media', 'Google Ads', 'Content Marketing', 'Webinars'],
        datasets: [{
          label: 'Conversions',
          data: [120, 95, 200, 85, 60],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      }
    },
    aiPrompts: [
      'Show campaign performance',
      'Compare marketing channels',
      'Display campaign ROI',
      'Track marketing effectiveness'
    ],
    complexity: 'intermediate',
    lastUpdated: '2025-10-07',
    featured: true
  },
  {
    id: 'lead-sources',
    name: 'Lead Source Analysis',
    description: 'Track where your best leads are coming from across all channels',
    category: 'marketing',
    type: 'doughnut',
    tags: ['leads', 'sources', 'attribution', 'channels'],
    author: 'Marketing Team',
    rating: 4.6,
    downloads: 943,
    preview: '🎯',
    config: {
      type: 'doughnut',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Lead Sources Distribution' },
          legend: { position: 'bottom' }
        }
      }
    },
    dataStructure: {
      required: ['source', 'leads'],
      optional: ['quality_score', 'conversion_rate'],
      sampleData: {
        labels: ['Organic Search', 'Paid Ads', 'Social Media', 'Email', 'Direct', 'Referral'],
        datasets: [{
          data: [30, 25, 15, 12, 10, 8],
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        }]
      }
    },
    aiPrompts: [
      'Show lead sources',
      'Display lead attribution',
      'Analyze traffic sources',
      'Track lead generation channels'
    ],
    complexity: 'beginner',
    lastUpdated: '2025-10-04',
    featured: false
  }
];