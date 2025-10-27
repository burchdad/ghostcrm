"use client";
import React from 'react';
import { categories } from '../browse/lib/categories';

export default function ModalMarketplacePage() {
  const handleCategoryClick = (categoryId: string) => {
    // Handle category selection - you can customize this
    console.log('Selected category:', categoryId);
    // For now, just log. Later we can implement actual chart browsing
  };

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '0.75rem' 
        }}>
          Choose Your Chart Category
        </h2>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.95rem',
          lineHeight: '1.5',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Browse our curated collection of chart templates organized by business function. 
          Each category contains specialized visualizations designed for specific use cases.
        </p>
      </div>

      {/* Category Grid */}
      <div className="marketplace-grid">
        {categories.map(category => (
          <div
            key={category.id}
            className="marketplace-category"
            onClick={() => handleCategoryClick(category.id)}
          >
            {/* Category Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '1rem' 
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: `linear-gradient(135deg, ${getCategoryGradient(category.color)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                marginRight: '1rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                {category.icon}
              </div>
              <div>
                <h3>{category.name}</h3>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#3b82f6',
                  fontWeight: '500',
                  margin: '0.25rem 0 0 0'
                }}>
                  {category.count ? `${category.count} charts` : 'Multiple charts'}
                </p>
              </div>
            </div>

            {/* Category Description */}
            <p style={{ marginBottom: '1rem' }}>
              {category.description}
            </p>

            {/* Action Button */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <span style={{ 
                color: '#3b82f6', 
                fontWeight: '600', 
                fontSize: '0.85rem' 
              }}>
                Browse {category.name} Charts
              </span>
              <span style={{ 
                color: '#93c5fd',
                fontSize: '1.1rem'
              }}>
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to convert category color classes to CSS gradients
function getCategoryGradient(colorClass: string): string {
  const gradients: { [key: string]: string } = {
    'from-blue-500 to-blue-600': '#3b82f6, #2563eb',
    'from-green-500 to-green-600': '#10b981, #059669',
    'from-purple-500 to-purple-600': '#8b5cf6, #7c3aed',
    'from-orange-500 to-orange-600': '#f97316, #ea580c',
    'from-red-500 to-red-600': '#ef4444, #dc2626',
    'from-indigo-500 to-indigo-600': '#6366f1, #4f46e5',
    'from-pink-500 to-pink-600': '#ec4899, #db2777',
    'from-yellow-500 to-yellow-600': '#eab308, #ca8a04',
    'from-teal-500 to-teal-600': '#14b8a6, #0d9488'
  };
  
  return gradients[colorClass] || '#3b82f6, #2563eb';
}
