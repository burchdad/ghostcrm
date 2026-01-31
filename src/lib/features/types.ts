// Types for the features library
export interface FeatureBenefit {
  title: string;
  description: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string; // We'll use icon names as strings to avoid React component issues
  benefits: FeatureBenefit[];
  keyFeatures: string[];
  useCases: string[];
  pricing?: {
    starter: boolean;
    professional: boolean;
    enterprise: boolean;
  };
}

export interface FeatureCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // CSS color class for theming
  features: Feature[];
}

export interface FeaturesLibrary {
  categories: FeatureCategory[];
  totalFeatures: number;
}