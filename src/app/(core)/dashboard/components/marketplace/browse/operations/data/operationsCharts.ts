import { ChartTemplate } from '../../lib/types';

export const operationsCharts: ChartTemplate[] = [
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
    featured: true
  }
];