import { ChartTemplate } from '../../lib/types';

export const customCharts: ChartTemplate[] = [
  {
    id: 'custom-builder',
    name: 'Custom Chart Builder',
    description: 'Create your own charts with custom data sources and configurations',
    category: 'custom',
    type: 'bar',
    tags: ['custom', 'builder', 'flexible', 'configurable'],
    author: 'GhostCRM Team',
    rating: 4.8,
    downloads: 432,
    preview: '🎨',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Custom Chart' },
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    dataStructure: {
      required: ['label', 'value'],
      optional: ['color', 'target'],
      sampleData: {
        labels: ['Custom A', 'Custom B', 'Custom C', 'Custom D'],
        datasets: [{
          label: 'Custom Data',
          data: [10, 20, 15, 25],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }]
      }
    },
    aiPrompts: [
      'Create custom chart',
      'Build chart with my data',
      'Make personalized visualization',
      'Design custom dashboard widget'
    ],
    complexity: 'advanced',
    lastUpdated: '2025-10-01',
    featured: true
  }
];