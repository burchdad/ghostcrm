import { ChartTemplate } from '../../types';

export const operationsChartTemplates: ChartTemplate[] = [
  {
    id: 'operations-productivity',
    name: 'Team Productivity Metrics',
    description: 'Monitor team productivity and operational efficiency across departments',
    category: 'operations',
    type: 'radar',
    tags: ['productivity', 'efficiency', 'team', 'performance'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.6,
    downloads: 678,
    featured: false,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDIwIDEzMCw0MCAsMTIwLDcwIDgwLDcwIDcwLDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cG9seWdvbiBwb2ludHM9IjEwMCwzMCAxMjAsNDUgMTEwLDYwIDkwLDYwIDgwLDQ1IiBmaWxsPSIjM2I4MmY2IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+',
    config: {
      type: 'radar',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Team Productivity Radar'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    },
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false
    },
    dataRequirements: {
      required: ['metric', 'score'],
      optional: ['department', 'target'],
      minDataPoints: 3,
      maxDataPoints: 10,
      dataTypes: {
        metric: 'string',
        score: 'number',
        department: 'string',
        target: 'number'
      }
    },
    sampleData: {
      labels: ['Quality', 'Speed', 'Efficiency', 'Innovation', 'Collaboration', 'Communication'],
      datasets: [
        {
          label: 'Current Performance',
          data: [85, 78, 92, 70, 88, 82],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Target',
          data: [90, 85, 95, 80, 90, 85],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    },
    dataMapping: {
      categoryField: 'metric',
      valueField: 'score'
    },
    customization: {
      colors: {
        primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        schemes: {
          performance: ['#059669', '#0369a1', '#d97706', '#dc2626'],
          corporate: ['#1e40af', '#059669', '#d97706']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Team performance assessment',
      'Department comparison',
      'Goal tracking',
      'Skills evaluation'
    ],
    examples: [
      {
        title: 'Department Performance',
        description: 'Productivity metrics across departments',
        data: {
          labels: ['Quality', 'Speed', 'Efficiency', 'Communication'],
          datasets: [
            {
              label: 'Sales Team',
              data: [88, 92, 85, 95],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }
          ]
        }
      }
    ],
    source: 'organization'
  }
];

export default operationsChartTemplates;