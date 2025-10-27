import { Category } from './types';

export const categories: Category[] = [
  {
    id: 'sales',
    name: 'Sales',
    icon: '💰',
    description: 'Revenue tracking, conversion funnels, and sales performance charts',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📈',
    description: 'Campaign analytics, customer acquisition, and marketing ROI charts',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '🔍',
    description: 'Data insights, user behavior, and advanced analytics visualizations',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💵',
    description: 'Financial reports, budget tracking, and expense analysis charts',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: '⚙️',
    description: 'Process monitoring, inventory management, and operational KPIs',
    color: 'from-gray-500 to-slate-600'
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '🎨',
    description: 'Build your own charts with custom configurations and data sources',
    color: 'from-pink-500 to-rose-600'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryPath = (categoryId: string): string => {
  return `/dashboard/chart-marketplace/${categoryId}`;
};