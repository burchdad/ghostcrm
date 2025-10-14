import { ChartTemplate } from '../../lib/types';

export const financeCharts: ChartTemplate[] = [
  {
    id: 'expense-breakdown',
    name: 'Expense Breakdown',
    description: 'Analyze company expenses across different categories and departments',
    category: 'finance',
    type: 'pie',
    tags: ['expenses', 'budget', 'finance', 'breakdown'],
    author: 'Finance Team',
    rating: 4.6,
    downloads: 654,
    preview: '💰',
    config: {
      type: 'pie',
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Monthly Expense Breakdown' },
          legend: { position: 'right' }
        }
      }
    },
    dataStructure: {
      required: ['category', 'amount'],
      optional: ['budget', 'variance'],
      sampleData: {
        labels: ['Salaries', 'Marketing', 'Operations', 'Technology', 'Office', 'Travel'],
        datasets: [{
          data: [50000, 15000, 12000, 8000, 5000, 3000],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']
        }]
      }
    },
    aiPrompts: [
      'Show expense breakdown',
      'Display budget analysis',
      'Analyze spending categories',
      'Track financial performance'
    ],
    complexity: 'intermediate',
    lastUpdated: '2025-10-02',
    featured: true
  }
];