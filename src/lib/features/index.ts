import { FeaturesLibrary } from './types';
import { leadManagementFeatures } from './lead-management';
import { salesPipelineFeatures } from './sales-pipeline';
import { automationFeatures } from './automation';

// Main features library - single source of truth
export const featuresLibrary: FeaturesLibrary = {
  categories: [
    leadManagementFeatures,
    salesPipelineFeatures,
    automationFeatures
  ],
  totalFeatures: 0 // Will be calculated dynamically
};

// Calculate total features
featuresLibrary.totalFeatures = featuresLibrary.categories.reduce(
  (total, category) => total + category.features.length,
  0
);

// Helper functions to get data from the library
export const getFeaturesLibrary = (): FeaturesLibrary => featuresLibrary;

export const getFeatureCategory = (categoryId: string) => {
  return featuresLibrary.categories.find(category => category.id === categoryId);
};

export const getFeature = (categoryId: string, featureId: string) => {
  const category = getFeatureCategory(categoryId);
  return category?.features.find(feature => feature.id === featureId);
};

export const getAllFeatures = () => {
  return featuresLibrary.categories.flatMap(category => 
    category.features.map(feature => ({
      ...feature,
      categoryId: category.id,
      categoryTitle: category.title
    }))
  );
};

export const searchFeatures = (query: string) => {
  const allFeatures = getAllFeatures();
  const searchTerm = query.toLowerCase();
  
  return allFeatures.filter(feature => 
    feature.title.toLowerCase().includes(searchTerm) ||
    feature.description.toLowerCase().includes(searchTerm) ||
    feature.shortDescription.toLowerCase().includes(searchTerm) ||
    feature.keyFeatures.some(kf => kf.toLowerCase().includes(searchTerm))
  );
};

// Icon mapping helper (to avoid React component import issues)
export const getIconComponent = (iconName: string) => {
  // This will be used in components to map string names to actual icon components
  const iconMap: Record<string, string> = {
    'Target': 'Target',
    'Users': 'Users',
    'Brain': 'Brain',
    'MessageCircle': 'MessageCircle',
    'TrendingUp': 'TrendingUp',
    'Monitor': 'Monitor',
    'BarChart3': 'BarChart3',
    'FileText': 'FileText',
    'Zap': 'Zap',
    'Workflow': 'Workflow',
    'Clock': 'Clock'
  };
  
  return iconMap[iconName] || 'Star';
};