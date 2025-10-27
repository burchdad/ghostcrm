import { ChartTemplate } from '../../types';

export const salesChartTemplates: ChartTemplate[] = [
  {
    id: 'sales-revenue-trend',
    name: 'Revenue Trend Analysis',
    description: 'Track revenue growth over time with trend indicators and forecasting',
    category: 'sales',
    type: 'line',
    tags: ['revenue', 'growth', 'trend', 'forecasting'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.8,
    downloads: 1247,
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0yMCA4MEM0MCA2MCA2MCA0MCA4MCAzMCAxMDAgMjUgMTIwIDM1IDE0MCAyMCAxNjAgMTUgMTgwIDEwIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=',
    source: 'marketplace',
    config: {
      type: 'line',
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
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
              text: 'Revenue ($)'
            },
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Revenue Trend Analysis'
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
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
      required: ['date', 'revenue'],
      optional: ['forecast', 'target'],
      minDataPoints: 3,
      maxDataPoints: 365,
      dataTypes: {
        date: 'date',
        revenue: 'number',
        forecast: 'number',
        target: 'number'
      }
    },
    sampleData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Actual Revenue',
          data: [65000, 78000, 82000, 95000, 88000, 105000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Target Revenue',
          data: [70000, 75000, 80000, 90000, 95000, 100000],
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    dataMapping: {
      xAxis: 'date',
      yAxis: 'revenue',
      series: 'type'
    },
    customization: {
      colors: {
        primary: ['#3b82f6', '#10b981', '#f59e0b'],
        schemes: {
          professional: ['#1f2937', '#374151', '#6b7280'],
          vibrant: ['#dc2626', '#ea580c', '#d97706'],
          cool: ['#1e40af', '#0369a1', '#0891b2']
        }
      },
      themes: ['light', 'dark', 'professional'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Monthly/Quarterly revenue tracking',
      'Sales performance analysis',
      'Revenue forecasting',
      'Target vs actual comparison'
    ],
    examples: [
      {
        title: 'Monthly Revenue Growth',
        description: 'Track monthly revenue with year-over-year comparison',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              label: '2024',
              data: [120000, 135000, 148000, 162000, 175000],
              borderColor: '#3b82f6'
            },
            {
              label: '2023',
              data: [98000, 105000, 118000, 125000, 135000],
              borderColor: '#94a3b8'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'sales-pipeline-funnel',
    name: 'Sales Pipeline Funnel',
    description: 'Visualize lead progression through sales stages with conversion rates',
    category: 'sales',
    type: 'funnel',
    tags: ['pipeline', 'conversion', 'funnel', 'stages'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.7,
    downloads: 892,
    featured: true,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+Cjxwb2x5Z29uIHBvaW50cz0iNDAsMjAgMTYwLDIwIDEyMCw0MCA4MCw0MCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjxwb2x5Z29uIHBvaW50cz0iODAsNDAgMTIwLDQwIDEwMCw2MCA4MCw2MCIgZmlsbD0iIzEwYjk4MSIgb3BhY2l0eT0iMC44Ii8+Cjxwb2x5Z29uIHBvaW50cz0iODAsNjAgMTAwLDYwIDk1LDgwIDg1LDgwIiBmaWxsPSIjZjU5ZTBiIiBvcGFjaXR5PSIwLjgiLz4KPC9zdmc+',
    source: 'marketplace',
    config: {
      type: 'bar',
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Pipeline Funnel'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const percentage = Math.round((context.parsed.x / context.dataset.data[0]) * 100);
                return `${context.label}: ${context.parsed.x} leads (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Leads'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Sales Stage'
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
      required: ['stage', 'count'],
      optional: ['conversion_rate'],
      minDataPoints: 3,
      maxDataPoints: 10,
      dataTypes: {
        stage: 'string',
        count: 'number',
        conversion_rate: 'number'
      }
    },
    sampleData: {
      labels: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
      datasets: [
        {
          label: 'Lead Count',
          data: [1000, 450, 200, 120, 85],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6'
          ],
          borderWidth: 1
        }
      ]
    },
    dataMapping: {
      categoryField: 'stage',
      valueField: 'count'
    },
    customization: {
      colors: {
        primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        schemes: {
          gradient: ['#1e3a8a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
          heat: ['#dc2626', '#ea580c', '#f59e0b', '#eab308', '#84cc16']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Sales pipeline analysis',
      'Conversion rate tracking',
      'Bottleneck identification',
      'Team performance evaluation'
    ],
    examples: [
      {
        title: 'B2B Sales Pipeline',
        description: 'Typical B2B sales funnel with 5 stages',
        data: {
          labels: ['Leads', 'MQL', 'SQL', 'Opportunity', 'Customer'],
          datasets: [
            {
              data: [1500, 600, 300, 150, 45],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }
          ]
        }
      }
    ]
  },
  {
    id: 'sales-rep-performance',
    name: 'Sales Rep Performance',
    description: 'Compare individual sales representative performance metrics',
    category: 'sales',
    type: 'bar',
    tags: ['performance', 'team', 'comparison', 'kpi'],
    author: 'GhostCRM Team',
    version: '1.0.0',
    rating: 4.6,
    downloads: 723,
    featured: false,
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjhmOWZhIi8+CjxyZWN0IHg9IjIwIiB5PSI3MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjM2I4MmY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjgwIiB5PSI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjU5ZTBiIi8+CjxyZWN0IHg9IjExMCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2VmNDQ0NCIvPgo8cmVjdCB4PSIxNDAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iNzAiIGZpbGw9IiM4YjVjZjYiLz4KPC9zdmc+',
    source: 'marketplace',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Rep Performance Comparison'
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
            title: {
              display: true,
              text: 'Sales Representative'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Performance Metric'
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
      required: ['rep_name', 'revenue', 'deals_closed'],
      optional: ['calls_made', 'emails_sent', 'meetings_booked'],
      minDataPoints: 2,
      maxDataPoints: 50,
      dataTypes: {
        rep_name: 'string',
        revenue: 'number',
        deals_closed: 'number',
        calls_made: 'number',
        emails_sent: 'number',
        meetings_booked: 'number'
      }
    },
    sampleData: {
      labels: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Lee', 'Eva Wilson'],
      datasets: [
        {
          label: 'Revenue ($)',
          data: [125000, 98000, 156000, 87000, 143000],
          backgroundColor: '#3b82f6',
          yAxisID: 'y'
        },
        {
          label: 'Deals Closed',
          data: [12, 8, 15, 7, 14],
          backgroundColor: '#10b981',
          yAxisID: 'y1'
        }
      ]
    },
    dataMapping: {
      xAxis: 'rep_name',
      yAxis: 'revenue',
      series: 'metric_type'
    },
    customization: {
      colors: {
        primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        schemes: {
          corporate: ['#1e40af', '#059669', '#d97706'],
          modern: ['#6366f1', '#06b6d4', '#84cc16']
        }
      },
      themes: ['light', 'dark'],
      responsive: true,
      animations: true,
      interactive: true
    },
    useCases: [
      'Individual performance tracking',
      'Team comparison and ranking',
      'Goal achievement monitoring',
      'Compensation planning'
    ],
    examples: [
      {
        title: 'Q3 Performance Review',
        description: 'Quarterly sales rep performance comparison',
        data: {
          labels: ['Rep A', 'Rep B', 'Rep C', 'Rep D'],
          datasets: [
            {
              label: 'Revenue',
              data: [180000, 145000, 210000, 125000],
              backgroundColor: '#3b82f6'
            }
          ]
        }
      }
    ]
  }
];

export default salesChartTemplates;