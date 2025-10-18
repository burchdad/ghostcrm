import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Chart template interface
interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  config: any;
  dataStructure: {
    requiredFields: string[];
    sampleData: any;
  };
  popularity: number;
  rating: number;
  downloads: number;
  author: string;
  created: string;
  updated: string;
}

// Extended chart templates for marketplace
const marketplaceChartTemplates: ChartTemplate[] = [
  {
    id: 'sales-performance-bar',
    name: 'Sales Performance Dashboard',
    description: 'Track sales metrics with quarterly comparisons and team performance indicators',
    type: 'bar',
    category: 'sales',
    tags: ['sales', 'revenue', 'quarterly', 'performance'],
    difficulty: 'beginner',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Sales Performance by Quarter' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
          x: { title: { display: true, text: 'Quarter' } }
        }
      }
    },
    dataStructure: {
      requiredFields: ['quarter', 'revenue', 'target'],
      sampleData: {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        datasets: [
          {
            label: 'Actual Revenue',
            data: [125000, 150000, 175000, 200000],
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            borderWidth: 1
          },
          {
            label: 'Target Revenue',
            data: [120000, 160000, 180000, 210000],
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1
          }
        ]
      }
    },
    popularity: 95,
    rating: 4.8,
    downloads: 2847,
    author: 'GhostCRM Team',
    created: '2024-01-15',
    updated: '2024-03-20'
  },
  {
    id: 'lead-conversion-funnel',
    name: 'Lead Conversion Funnel',
    description: 'Visualize lead progression through sales funnel stages with conversion rates',
    type: 'bar',
    category: 'marketing',
    tags: ['leads', 'conversion', 'funnel', 'marketing'],
    difficulty: 'intermediate',
    config: {
      type: 'bar',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Lead Conversion Funnel' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Count' } },
          x: { title: { display: true, text: 'Funnel Stage' } }
        }
      }
    },
    dataStructure: {
      requiredFields: ['stage', 'count', 'conversion_rate'],
      sampleData: {
        labels: ['Leads', 'Qualified', 'Opportunities', 'Proposals', 'Closed Won'],
        datasets: [
          {
            label: 'Lead Count',
            data: [1000, 400, 200, 100, 75],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 1
          }
        ]
      }
    },
    popularity: 87,
    rating: 4.6,
    downloads: 1923,
    author: 'Marketing Pro',
    created: '2024-02-01',
    updated: '2024-03-15'
  },
  {
    id: 'customer-satisfaction-radar',
    name: 'Customer Satisfaction Radar',
    description: 'Multi-dimensional customer satisfaction analysis across different service areas',
    type: 'radar',
    category: 'analytics',
    tags: ['customer', 'satisfaction', 'feedback', 'analysis'],
    difficulty: 'advanced',
    config: {
      type: 'radar',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Customer Satisfaction Analysis' }
        },
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { stepSize: 2 }
          }
        }
      }
    },
    dataStructure: {
      requiredFields: ['dimension', 'score'],
      sampleData: {
        labels: ['Product Quality', 'Customer Service', 'Value for Money', 'Delivery Speed', 'User Experience', 'Support Response'],
        datasets: [
          {
            label: 'Current Quarter',
            data: [8.5, 7.2, 8.1, 6.8, 7.9, 8.3],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#3b82f6'
          },
          {
            label: 'Previous Quarter',
            data: [7.8, 6.9, 7.6, 6.2, 7.4, 7.9],
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#ef4444'
          }
        ]
      }
    },
    popularity: 72,
    rating: 4.4,
    downloads: 856,
    author: 'Analytics Expert',
    created: '2024-01-28',
    updated: '2024-03-10'
  },
  {
    id: 'revenue-trend-line',
    name: 'Revenue Trend Analysis',
    description: 'Time-series analysis of revenue trends with forecasting indicators',
    type: 'line',
    category: 'finance',
    tags: ['revenue', 'trends', 'forecasting', 'time-series'],
    difficulty: 'intermediate',
    config: {
      type: 'line',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Revenue Trend Analysis' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
          x: { title: { display: true, text: 'Month' } }
        }
      }
    },
    dataStructure: {
      requiredFields: ['month', 'revenue', 'forecast'],
      sampleData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Actual Revenue',
            data: [45000, 52000, 48000, 61000, 55000, 67000, 63000, 71000, 69000, 73000, 78000, 82000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Forecast',
            data: [null, null, null, null, null, null, null, null, 70000, 75000, 80000, 85000],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      }
    },
    popularity: 91,
    rating: 4.7,
    downloads: 2341,
    author: 'Finance Team',
    created: '2024-01-10',
    updated: '2024-03-25'
  },
  {
    id: 'market-share-pie',
    name: 'Market Share Distribution',
    description: 'Competitive market analysis showing market share distribution by company',
    type: 'pie',
    category: 'analytics',
    tags: ['market', 'competition', 'share', 'analysis'],
    difficulty: 'beginner',
    config: {
      type: 'pie',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Market Share Analysis' }
        }
      }
    },
    dataStructure: {
      requiredFields: ['company', 'market_share'],
      sampleData: {
        labels: ['Your Company', 'Competitor A', 'Competitor B', 'Competitor C', 'Others'],
        datasets: [
          {
            label: 'Market Share (%)',
            data: [28, 23, 18, 15, 16],
            backgroundColor: [
              '#10b981',
              '#3b82f6',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      }
    },
    popularity: 84,
    rating: 4.5,
    downloads: 1567,
    author: 'Business Intelligence',
    created: '2024-02-15',
    updated: '2024-03-18'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const limit = parseInt(searchParams.get('limit') || '20');

    let filteredTemplates = [...marketplaceChartTemplates];

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort templates
    filteredTemplates.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.popularity - a.popularity;
      }
    });

    // Limit results
    const limitedTemplates = filteredTemplates.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        templates: limitedTemplates,
        total: filteredTemplates.length,
        categories: ['sales', 'marketing', 'finance', 'analytics', 'operations'],
        sortOptions: ['popularity', 'rating', 'downloads', 'newest', 'name']
      }
    });

  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, action } = body;

    if (action === 'install') {
      // Find template
      const template = marketplaceChartTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      // Simulate installation (in real app, would save to user's dashboard)
      // Increment download count
      template.downloads += 1;

      return NextResponse.json({
        success: true,
        data: {
          message: `Chart template "${template.name}" installed successfully`,
          template: template
        }
      });
    }

    if (action === 'rate') {
      const { rating } = body;
      const template = marketplaceChartTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      // Simulate rating update (in real app, would update database)
      template.rating = ((template.rating * template.downloads) + rating) / (template.downloads + 1);

      return NextResponse.json({
        success: true,
        data: { message: 'Rating submitted successfully' }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Marketplace POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}