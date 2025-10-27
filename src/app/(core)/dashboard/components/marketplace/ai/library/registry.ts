import { ChartLibrary, ChartCategoryInfo, ChartTemplate } from './types';
import salesChartTemplates from './categories/sales';
import marketingChartTemplates from './categories/marketing';
import analyticsChartTemplates from './categories/analytics';
import financeChartTemplates from './categories/finance';
import operationsChartTemplates from './categories/operations';

// Chart Library Registry - Central hub for all chart templates
export class ChartLibraryRegistry {
  private static instance: ChartLibraryRegistry;
  private library: ChartLibrary;

  private constructor() {
    this.library = this.initializeLibrary();
  }

  public static getInstance(): ChartLibraryRegistry {
    if (!ChartLibraryRegistry.instance) {
      ChartLibraryRegistry.instance = new ChartLibraryRegistry();
    }
    return ChartLibraryRegistry.instance;
  }

  private initializeLibrary(): ChartLibrary {
    const categories: ChartCategoryInfo[] = [
      {
        id: 'sales',
        name: 'Sales & Revenue',
        description: 'Track revenue, pipeline performance, and sales team metrics',
        icon: '💰',
        color: '#10b981',
        templates: salesChartTemplates
      },
      {
        id: 'marketing',
        name: 'Marketing & Campaigns',
        description: 'Monitor campaign performance, lead generation, and ROI',
        icon: '📈',
        color: '#3b82f6',
        templates: marketingChartTemplates
      },
      {
        id: 'analytics',
        name: 'Analytics & Insights',
        description: 'Analyze user behavior, engagement, and conversion patterns',
        icon: '🔍',
        color: '#8b5cf6',
        templates: analyticsChartTemplates
      },
      {
        id: 'finance',
        name: 'Finance & Accounting',
        description: 'Monitor cash flow, budgets, and financial health',
        icon: '💼',
        color: '#f59e0b',
        templates: financeChartTemplates
      },
      {
        id: 'operations',
        name: 'Operations & Efficiency',
        description: 'Track productivity, team performance, and operational metrics',
        icon: '⚙️',
        color: '#ef4444',
        templates: operationsChartTemplates
      }
    ];

    // Aggregate all templates
    const allTemplates = categories.reduce((acc, category) => {
      return acc.concat(category.templates);
    }, [] as ChartTemplate[]);

    // Featured templates (high rating and downloads)
    const featured = allTemplates
      .filter(template => template.featured || (template.rating >= 4.7 && template.downloads >= 1000))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    // Popular templates (by downloads)
    const popular = allTemplates
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 8);

    // Recent templates (by creation/update date)
    const recent = allTemplates
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);

    return {
      categories,
      featured,
      popular,
      recent
    };
  }

  // Public API methods
  public getLibrary(): ChartLibrary {
    return this.library;
  }

  public getCategories(): ChartCategoryInfo[] {
    return this.library.categories;
  }

  public getCategoryById(categoryId: string): ChartCategoryInfo | undefined {
    return this.library.categories.find(cat => cat.id === categoryId);
  }

  public getTemplateById(templateId: string): ChartTemplate | undefined {
    for (const category of this.library.categories) {
      const template = category.templates.find(t => t.id === templateId);
      if (template) return template;
    }
    return undefined;
  }

  public getFeaturedTemplates(): ChartTemplate[] {
    return this.library.featured;
  }

  public getPopularTemplates(): ChartTemplate[] {
    return this.library.popular;
  }

  public getRecentTemplates(): ChartTemplate[] {
    return this.library.recent;
  }

  public searchTemplates(filters: {
    query?: string;
    category?: string;
    type?: string;
    tags?: string[];
    minRating?: number;
  }): ChartTemplate[] {
    let results: ChartTemplate[] = [];
    
    // Get templates from specific category or all categories
    if (filters.category) {
      const category = this.getCategoryById(filters.category);
      results = category ? [...category.templates] : [];
    } else {
      results = this.library.categories.reduce((acc, cat) => acc.concat(cat.templates), [] as ChartTemplate[]);
    }

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.type) {
      results = results.filter(template => template.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(template => 
        filters.tags!.some(tag => template.tags.includes(tag))
      );
    }

    if (filters.minRating) {
      results = results.filter(template => template.rating >= filters.minRating!);
    }

    return results;
  }

  public getTemplatesByCategory(categoryId: string): ChartTemplate[] {
    const category = this.getCategoryById(categoryId);
    return category ? category.templates : [];
  }

  public getTemplatesByType(chartType: string): ChartTemplate[] {
    const allTemplates = this.library.categories.reduce((acc, cat) => acc.concat(cat.templates), [] as ChartTemplate[]);
    return allTemplates.filter(template => template.type === chartType);
  }

  public getAllTemplates(): ChartTemplate[] {
    return this.library.categories.reduce((acc, cat) => acc.concat(cat.templates), [] as ChartTemplate[]);
  }

  // Statistics
  public getLibraryStats() {
    const allTemplates = this.getAllTemplates();
    const totalDownloads = allTemplates.reduce((sum, template) => sum + template.downloads, 0);
    const avgRating = allTemplates.reduce((sum, template) => sum + template.rating, 0) / allTemplates.length;
    
    const typeDistribution = allTemplates.reduce((acc, template) => {
      acc[template.type] = (acc[template.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTemplates: allTemplates.length,
      totalCategories: this.library.categories.length,
      totalDownloads,
      averageRating: Math.round(avgRating * 10) / 10,
      typeDistribution,
      featuredCount: this.library.featured.length
    };
  }
}

// Convenience functions for easy import
export const chartLibrary = ChartLibraryRegistry.getInstance();

export const getChartLibrary = () => chartLibrary.getLibrary();
export const getChartCategories = () => chartLibrary.getCategories();
export const getChartTemplate = (id: string) => chartLibrary.getTemplateById(id);
export const getFeaturedCharts = () => chartLibrary.getFeaturedTemplates();
export const getPopularCharts = () => chartLibrary.getPopularTemplates();
export const getRecentCharts = () => chartLibrary.getRecentTemplates();
export const searchCharts = (filters: any) => chartLibrary.searchTemplates(filters);
export const getChartsByCategory = (categoryId: string) => chartLibrary.getTemplatesByCategory(categoryId);

export default ChartLibraryRegistry;