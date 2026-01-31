import { ChartTemplate } from '../../lib/types';

export const analyticsCharts: ChartTemplate[] = [
  {
    id: 'user-behavior-flow',
    name: 'User Behavior Flow',
    description: 'Analyze user journey and behavior patterns across your application',
    category: 'analytics',
    type: 'line',
    tags: ['behavior', 'flow', 'journey', 'analytics'],
    author: 'Analytics Team',
    rating: 4.9,
    downloads: 756,
    preview: '🔄',
    config: {
      type: 'line',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'User Behavior Flow' },
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    dataStructure: {
      required: ['step', 'users'],
      optional: ['conversion_rate', 'dropoff'],
      sampleData: {
        labels: ['Landing', 'Product View', 'Add to Cart', 'Checkout', 'Purchase'],
        datasets: [{
          label: 'Users',
          data: [1000, 750, 400, 250, 180],
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }]
      }
    },
    aiPrompts: [
      'Show user behavior flow',
      'Display user journey',
      'Analyze conversion funnel',
      'Track user progression'
    ],
    complexity: 'advanced',
    lastUpdated: '2025-10-03',
    featured: true
  }
];