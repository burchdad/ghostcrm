import { ChartTemplate } from '../../types';

export const analyticsChartTemplates: ChartTemplate[] = [
  {
    id: 'analytics-user-behavior',
    name: 'User Behavior Flow',
    description: 'Track user journey and behavior patterns through your application',
    category: 'analytics',
    type: 'area',
    tags: ['behavior', 'journey', 'engagement', 'flow'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.8,
    downloads: 945,
    featured: true,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0yMCAxMDBDNDAgODAgNjAgNjAgODAgNzAgMTAwIDUwIDEyMCAzMCAxNDAgNDAgMTYwIDIwIDE4MCAxMCIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjY7c3RvcC1vcGFjaXR5OjAuMyIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eTowIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjwvY3ZnPg==',
    config: {
      type: 'line',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'User Behavior Analytics'
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time Period'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'User Count'
            },
            beginAtZero: true
          }
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    },
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false
    },
    dataRequirements: {
      required: ['timestamp', 'action', 'user_count'],
      optional: ['page', 'device_type', 'conversion'],
      minDataPoints: 5,
      maxDataPoints: 1000,
      dataTypes: {
        timestamp: 'date',
        action: 'string',
        user_count: 'number',
        page: 'string',
        device_type: 'string',
        conversion: 'boolean'
      }
    },
    sampleData: {
      labels: ['Page Load', 'Content View', 'Interaction', 'Form Start', 'Form Submit', 'Purchase'],
      datasets: [
        {
          label: 'Desktop Users',
          data: [1200, 950, 720, 450, 380, 95],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Mobile Users',
          data: [800, 680, 520, 320, 280, 65],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    dataMapping: {
      xAxis: 'action',
      yAxis: 'user_count',
      series: 'device_type'
    },
    customization: {
      colors: {
        primary: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        schemes: {
          digital: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
          ocean: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'User journey optimization',
      'Conversion funnel analysis',
      'Drop-off point identification',
      'A/B testing results'
    ],
    examples: [
      {
        title: 'E-commerce Funnel',
        description: 'Customer journey from landing to purchase',
        data: {
          labels: ['Landing', 'Product View', 'Add to Cart', 'Checkout', 'Payment'],
          datasets: [
            {
              data: [5000, 3200, 1800, 900, 720],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              fill: true
            }
          ]
        }
      }
    ],
    source: 'marketplace'
  }
];

export default analyticsChartTemplates;