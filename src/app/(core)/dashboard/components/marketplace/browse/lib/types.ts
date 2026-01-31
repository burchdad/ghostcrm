export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'analytics' | 'finance' | 'operations' | 'custom';
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area' | 'radar';
  tags: string[];
  author: string;
  rating: number;
  downloads: number;
  preview: string; // Base64 or URL to preview image
  config: any; // Chart.js configuration
  dataStructure: {
    required: string[];
    optional: string[];
    sampleData: any;
  };
  aiPrompts: string[]; // Example prompts that would generate this chart
  complexity: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count?: number;
}

export interface ChartMarketplaceProps {
  onSelectChart: (template: ChartTemplate) => void;
  onInstallChart: (template: ChartTemplate) => void;
  currentCategory?: string;
}