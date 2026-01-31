import { ChartTemplate } from './types';
import { salesCharts } from '../sales/data/salesCharts';
import { marketingCharts } from '../marketing/data/marketingCharts';
import { analyticsCharts } from '../analytics/data/analyticsCharts';
import { financeCharts } from '../finance/data/financeCharts';
import { operationsCharts } from '../operations/data/operationsCharts';
import { customCharts } from '../custom/data/customCharts';

export const allCharts: ChartTemplate[] = [
  ...salesCharts,
  ...marketingCharts,
  ...analyticsCharts,
  ...financeCharts,
  ...operationsCharts,
  ...customCharts
];

export const getChartsByCategory = (category: string): ChartTemplate[] => {
  switch (category) {
    case 'sales':
      return salesCharts;
    case 'marketing':
      return marketingCharts;
    case 'analytics':
      return analyticsCharts;
    case 'finance':
      return financeCharts;
    case 'operations':
      return operationsCharts;
    case 'custom':
      return customCharts;
    default:
      return allCharts;
  }
};

export const getChartById = (id: string): ChartTemplate | undefined => {
  return allCharts.find(chart => chart.id === id);
};

export const getFeaturedCharts = (): ChartTemplate[] => {
  return allCharts.filter(chart => chart.featured);
};

export const getChartCounts = () => {
  return {
    total: allCharts.length,
    sales: salesCharts.length,
    marketing: marketingCharts.length,
    analytics: analyticsCharts.length,
    finance: financeCharts.length,
    operations: operationsCharts.length,
    custom: customCharts.length
  };
};