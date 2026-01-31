// Central export for all feature categories
import { leadManagementFeatures } from './lead-management'
import { salesPipelineFeatures } from './sales-pipeline'
import { automationFeatures } from './automation'
import type { FeatureCategory } from './types'

export const featureCategories: FeatureCategory[] = [
  leadManagementFeatures,
  salesPipelineFeatures,
  automationFeatures
]

// Export individual categories for direct access
export {
  leadManagementFeatures,
  salesPipelineFeatures,
  automationFeatures
}

// Helper functions for finding features
export function getCategoryById(id: string): FeatureCategory | undefined {
  return featureCategories.find(category => category.id === id)
}

export function getFeatureById(categoryId: string, featureId: string) {
  const category = getCategoryById(categoryId)
  return category?.features.find(feature => feature.id === featureId)
}

export function getAllFeatures() {
  return featureCategories.flatMap(category => 
    category.features.map(feature => ({
      ...feature,
      categoryId: category.id,
      categoryTitle: category.title
    }))
  )
}