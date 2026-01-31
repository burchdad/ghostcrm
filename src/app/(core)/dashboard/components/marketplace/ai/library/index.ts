// Chart Library Main Export
export * from './types';
export * from './registry';
export { default as salesChartTemplates } from './categories/sales';
export { default as marketingChartTemplates } from './categories/marketing';
export { default as analyticsChartTemplates } from './categories/analytics';
export { default as financeChartTemplates } from './categories/finance';
export { default as operationsChartTemplates } from './categories/operations';

// Re-export convenience functions
export {
  chartLibrary,
  getChartLibrary,
  getChartCategories,
  getChartTemplate,
  getFeaturedCharts,
  getPopularCharts,
  getRecentCharts,
  searchCharts,
  getChartsByCategory
} from './registry';