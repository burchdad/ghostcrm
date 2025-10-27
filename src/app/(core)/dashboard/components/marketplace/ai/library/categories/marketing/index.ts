import { ChartTemplate } from '../../types';

export const marketingChartTemplates: ChartTemplate[] = [
  {
    id: 'marketing-campaign-roi',
    name: 'Campaign ROI Analysis',
    description: 'Track return on investment for marketing campaigns across different channels',
    category: 'marketing',
    type: 'bar',
    tags: ['roi', 'campaigns', 'channels', 'performance'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.9,
    downloads: 1456,
    featured: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjUwIiB5PSI2MCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjQwIiBmaWxsPSIjM2I4MmY2Ii8+CjxyZWN0IHg9IjgwIiB5PSIzMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjcwIiBmaWxsPSIjZjU5ZTBiIi8+CjxyZWN0IHg9IjExMCIgeT0iNTAiIHdpZHRoPSIyNSIgaGVpZ2h0PSI1MCIgZmlsbD0iI2VmNDQ0NCIvPgo8L3N2Zz4=',
    source: 'marketplace',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Marketing Campaign ROI by Channel'
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any): string {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Marketing Channel'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'ROI (%)'
            },
            ticks: {
              callback: function(value: any) {
                return value + '%';
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
      required: ['channel', 'spent', 'revenue'],
      optional: ['leads', 'conversions', 'cost_per_lead'],
      minDataPoints: 2,
      maxDataPoints: 20,
      dataTypes: {
        channel: 'string',
        spent: 'number',
        revenue: 'number',
        leads: 'number',
        conversions: 'number',
        cost_per_lead: 'number'
      }
    },
    sampleData: {
      labels: ['Google Ads', 'Facebook', 'LinkedIn', 'Email', 'Content Marketing'],
      datasets: [
        {
          label: 'ROI (%)',
          data: [245, 180, 320, 150, 420],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6'
          ],
          borderWidth: 1
        }
      ]
    },
    dataMapping: {
      xAxis: 'channel',
      yAxis: 'roi_percentage'
    },
    customization: {
      colors: {
        primary: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        schemes: {
          performance: ['#dc2626', '#ea580c', '#f59e0b', '#84cc16', '#10b981'],
          channels: ['#1e40af', '#0369a1', '#0891b2', '#0d9488', '#059669']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Campaign performance evaluation',
      'Budget allocation optimization',
      'Channel effectiveness comparison',
      'Marketing investment planning'
    ],
    examples: [
      {
        title: 'Q2 Campaign Results',
        description: 'ROI comparison across all marketing channels',
        data: {
          labels: ['PPC', 'Social Media', 'SEO', 'Email'],
          datasets: [
            {
              data: [180, 240, 350, 160],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            }
          ]
        }
      }
    ]
  },
  {
    id: 'marketing-lead-sources',
    name: 'Lead Source Distribution',
    description: 'Visualize lead generation sources and their contribution percentages',
    category: 'marketing',
    type: 'doughnut',
    tags: ['leads', 'sources', 'attribution', 'distribution'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.7,
    downloads: 1123,
    featured: true,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtZGFzaGFycmF5PSI2MyA2MyIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWRhc2hhcnJheT0iNDAgMjUxIiBzdHJva2UtZGFzaG9mZnNldD0iNjMiLz4KPC9zdmc+',
    source: 'marketplace',
    config: {
      type: 'doughnut',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Lead Source Distribution'
          },
          legend: {
            display: true,
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context: any): string {
                const percentage = Math.round((context.parsed / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100);
                return `${context.label}: ${context.parsed} leads (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    },
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false
    },
    dataRequirements: {
      required: ['source', 'leads'],
      optional: ['conversion_rate', 'cost_per_lead'],
      minDataPoints: 3,
      maxDataPoints: 15,
      dataTypes: {
        source: 'string',
        leads: 'number',
        conversion_rate: 'number',
        cost_per_lead: 'number'
      }
    },
    sampleData: {
      labels: ['Organic Search', 'Paid Search', 'Social Media', 'Email Marketing', 'Referrals', 'Direct'],
      datasets: [
        {
          label: 'Lead Count',
          data: [345, 267, 189, 156, 98, 67],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    },
    dataMapping: {
      categoryField: 'source',
      valueField: 'leads'
    },
    customization: {
      colors: {
        primary: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        schemes: {
          digital: ['#1e40af', '#0369a1', '#0891b2', '#0d9488', '#059669', '#65a30d'],
          warm: ['#dc2626', '#ea580c', '#f59e0b', '#eab308', '#84cc16', '#22c55e']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Lead attribution analysis',
      'Marketing channel effectiveness',
      'Budget allocation decisions',
      'Source performance tracking'
    ],
    examples: [
      {
        title: 'Monthly Lead Sources',
        description: 'Distribution of leads by acquisition channel',
        data: {
          labels: ['Website', 'Social', 'Ads', 'Events'],
          datasets: [
            {
              data: [450, 280, 320, 150],
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
            }
          ]
        }
      }
    ]
  },
  {
    id: 'marketing-campaign-timeline',
    name: 'Campaign Performance Timeline',
    description: 'Track campaign metrics over time to identify trends and patterns',
    category: 'marketing',
    type: 'line',
    tags: ['timeline', 'trends', 'performance', 'tracking'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.5,
    downloads: 834,
    featured: false,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0yMCA4MEM0MCA3MCA2MCA1MCA4MCA2MCAxMDAgNDAgMTIwIDMwIDE0MCA1MCAxNjAgMzUgMTgwIDI1IiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMjAgOTBDNDAgODUgNjAgNzUgODAgODAgMTAwIDcwIDEyMCA2MCAxNDAgNzAgMTYwIDY1IDE4MCA1NSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9zdmc+',
    source: 'marketplace',
    config: {
      type: 'line',
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Campaign Performance Timeline'
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Metric Value'
            },
            beginAtZero: true
          }
        }
      }
    },
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false
    },
    dataRequirements: {
      required: ['date', 'metric_value'],
      optional: ['campaign_name', 'metric_type'],
      minDataPoints: 5,
      maxDataPoints: 365,
      dataTypes: {
        date: 'date',
        metric_value: 'number',
        campaign_name: 'string',
        metric_type: 'string'
      }
    },
    sampleData: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Impressions',
          data: [12000, 15000, 18000, 22000, 19000, 25000],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Clicks',
          data: [480, 600, 720, 880, 760, 1000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    dataMapping: {
      xAxis: 'date',
      yAxis: 'metric_value',
      series: 'metric_type'
    },
    customization: {
      colors: {
        primary: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        schemes: {
          metrics: ['#059669', '#0369a1', '#d97706', '#dc2626'],
          soft: ['#86efac', '#93c5fd', '#fde68a', '#fca5a5']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Campaign performance monitoring',
      'Trend identification',
      'Seasonal pattern analysis',
      'A/B test tracking'
    ],
    examples: [
      {
        title: 'Email Campaign Metrics',
        description: 'Weekly email campaign performance tracking',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [
            {
              label: 'Open Rate (%)',
              data: [24, 28, 31, 26],
              borderColor: '#10b981'
            },
            {
              label: 'Click Rate (%)',
              data: [3.2, 4.1, 4.8, 3.9],
              borderColor: '#3b82f6'
            }
          ]
        }
      }
    ]
  }
];

export default marketingChartTemplates;