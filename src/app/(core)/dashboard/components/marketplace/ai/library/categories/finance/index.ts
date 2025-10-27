import { ChartTemplate } from '../../types';

export const financeChartTemplates: ChartTemplate[] = [
  {
    id: 'finance-cash-flow',
    name: 'Cash Flow Analysis',
    description: 'Track cash inflows and outflows to monitor financial health',
    category: 'finance',
    type: 'bar',
    tags: ['cash flow', 'financial health', 'liquidity', 'planning'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.9,
    downloads: 1567,
    featured: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjUwIiB5PSI2MCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjQwIiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjgwIiB5PSIzMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjUwIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjExMCIgeT0iNzAiIHdpZHRoPSIyNSIgaGVpZ2h0PSIzMCIgZmlsbD0iI2VmNDQ0NCIvPgo8L3N2Zz4=',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Cash Flow Analysis'
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const value = context.parsed.y;
                const formatted = value >= 0 ? `+$${value.toLocaleString()}` : `-$${Math.abs(value).toLocaleString()}`;
                return `${context.dataset.label}: ${formatted}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time Period'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Cash Flow ($)'
            },
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
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
      required: ['period', 'inflow', 'outflow'],
      optional: ['net_flow', 'category'],
      minDataPoints: 3,
      maxDataPoints: 24,
      dataTypes: {
        period: 'string',
        inflow: 'number',
        outflow: 'number',
        net_flow: 'number',
        category: 'string'
      }
    },
    sampleData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Cash Inflow',
          data: [150000, 180000, 165000, 195000, 175000, 210000],
          backgroundColor: '#10b981',
          borderWidth: 1
        },
        {
          label: 'Cash Outflow',
          data: [-120000, -145000, -135000, -160000, -150000, -170000],
          backgroundColor: '#ef4444',
          borderWidth: 1
        }
      ]
    },
    dataMapping: {
      xAxis: 'period',
      yAxis: 'amount',
      series: 'flow_type'
    },
    customization: {
      colors: {
        primary: ['#10b981', '#ef4444'],
        schemes: {
          financial: ['#059669', '#dc2626'],
          professional: ['#1f2937', '#991b1b']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Monthly cash flow monitoring',
      'Financial planning and forecasting',
      'Liquidity management',
      'Budget variance analysis'
    ],
    examples: [
      {
        title: 'Quarterly Cash Flow',
        description: 'Cash flow analysis by quarter',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Inflow',
              data: [450000, 520000, 480000, 580000],
              backgroundColor: '#10b981'
            },
            {
              label: 'Outflow',
              data: [-380000, -420000, -390000, -450000],
              backgroundColor: '#ef4444'
            }
          ]
        }
      }
    ],
    source: 'marketplace'
  }
];

export default financeChartTemplates;