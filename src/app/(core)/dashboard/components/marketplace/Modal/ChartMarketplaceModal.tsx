// components/charts/ChartMarketplaceModal.tsx
"use client";
import React, { useState } from "react";
import Modal from "@/components/ui/Modal";

interface Template {
  name: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  category: string;
  preview?: string;
  sampleData?: any;
  config?: any;
  source?: 'marketplace' | 'ai' | 'custom';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onInstall: (template: Template) => void;
}

const CATEGORIES: { title: string; desc: string; key: string; icon: string; gradient: string }[] = [
  { title: "Sales",       desc: "Revenue tracking, funnels, and performance KPIs", key: "sales", icon: "💰", gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { title: "Marketing",   desc: "Acquisition, campaigns, ROI analytics",          key: "marketing", icon: "📈", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
  { title: "Analytics",   desc: "User behavior and advanced insights",            key: "analytics", icon: "📊", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
  { title: "Finance",     desc: "Budgeting, expenses, P&L snapshots",             key: "finance", icon: "💳", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
  { title: "Operations",  desc: "Inventory, processes, operational KPIs",         key: "operations", icon: "⚙️", gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
  { title: "Custom",      desc: "Build bespoke charts from scratch",              key: "custom", icon: "🎨", gradient: "linear-gradient(135deg, #6366f1, #4f46e5)" },
];

const TEMPLATES: Template[] = [
  { name: "Sales Funnel",      type: "bar",   category: "Sales" },
  { name: "Revenue Breakdown", type: "pie",   category: "Finance" },
  { name: "Monthly Trends",    type: "line",  category: "Analytics" },
  { name: "Lead Sources",      type: "pie",   category: "Marketing" },
  { name: "Team Performance",  type: "bar",   category: "Operations" },
  { name: "Cohort Retention",  type: "line",  category: "Analytics" },
  { name: "Conversion Rate",   type: "line",  category: "Marketing" },
  { name: "Profit Margins",    type: "bar",   category: "Finance" },
  { name: "Sales Pipeline",    type: "bar",   category: "Sales" },
  { name: "Customer Segments", type: "pie",   category: "Analytics" },
  { name: "Inventory Status",  type: "bar",   category: "Operations" },
  { name: "Budget vs Actual",  type: "line",  category: "Finance" },
];

export default function ChartMarketplaceModal({ open, onClose, onInstall }: Props) {
  const [currentView, setCurrentView] = useState<'categories' | 'category-detail'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Calculate chart counts per category
  const getChartCount = (categoryTitle: string) => {
    return TEMPLATES.filter(template => template.category === categoryTitle).length;
  };

  // Get templates for selected category
  const getCategoryTemplates = (categoryTitle: string) => {
    return TEMPLATES.filter(template => template.category === categoryTitle);
  };

  // Handle category selection
  const handleCategorySelect = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
    setCurrentView('category-detail');
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('');
  };

  // Reset view when modal closes
  const handleClose = () => {
    setCurrentView('categories');
    setSelectedCategory('');
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Chart Marketplace" initialFocusSelector=".mp-action-primary">
      {currentView === 'categories' ? (
        // Categories View
        <>
          <div className="mp-hero">
            <div className="mp-emoji">🏪</div>
            <div className="mp-hero-text">
              <h3>Choose Your Chart Category</h3>
              <p>Browse curated templates organized by function. Each category contains charts designed for specific use cases.</p>
            </div>
          </div>

          <section className="mp-grid">
            {CATEGORIES.map((cat) => {
              const chartCount = getChartCount(cat.title);
              return (
                <article key={cat.key} className="mp-card" style={{ '--category-gradient': cat.gradient } as any}>
                  <header className="mp-card-header">
                    <div className="mp-card-icon">{cat.icon}</div>
                    <div className="mp-card-info">
                      <div className="mp-card-title">{cat.title}</div>
                      <div className="mp-card-sub">{chartCount} chart{chartCount !== 1 ? 's' : ''}</div>
                    </div>
                  </header>
                  <p className="mp-card-desc">{cat.desc}</p>
                  <button className="mp-link" onClick={() => handleCategorySelect(cat.title)}>
                    Browse {cat.title} Charts →
                  </button>
                </article>
              );
            })}
          </section>

          <section className="mp-divider" aria-hidden="true" />

          <section>
            <div className="mp-section-head">
              <h4>🔥 Popular Templates</h4>
              <button className="mp-action-secondary" onClick={handleClose}>Close</button>
            </div>

            <div className="mp-templates">
              {TEMPLATES.slice(0, 6).map((tpl, idx) => (
                <button
                  key={idx}
                  className="mp-template"
                  onClick={() => onInstall({
                    ...tpl,
                    source: 'marketplace',
                    sampleData: {
                      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                      datasets: [{ label: tpl.name, data: [10, 20, 15, 25] }]
                    },
                    config: { options: {} }
                  })}
                  title={`Add ${tpl.name}`}
                >
                  <div className="mp-template-preview" aria-hidden="true">
                    {tpl.type === 'bar' && '📊'}
                    {tpl.type === 'line' && '📈'}
                    {tpl.type === 'pie' && '🥧'}
                    <div className="mp-chart-type">{tpl.type.toUpperCase()}</div>
                  </div>
                  <div className="mp-template-meta">
                    <div className="mp-template-name">{tpl.name}</div>
                    <div className="mp-template-sub">{tpl.category}</div>
                  </div>
                  <span className="mp-template-add">✨ Add</span>
                </button>
              ))}
            </div>

            <div className="mp-actions">
              <button className="mp-action-secondary" onClick={() => window.open('/charts/custom', '_blank')}>
                🎨 Custom Builder
              </button>
              <button className="mp-action-primary" onClick={() => window.open('/charts/builder?mode=advanced', '_blank')}>
                ✨ AI Chart Builder
              </button>
            </div>
          </section>
        </>
      ) : (
        // Category Detail View
        <>
          <div className="mp-hero">
            <div className="mp-emoji">{CATEGORIES.find(c => c.title === selectedCategory)?.icon || '📊'}</div>
            <div className="mp-hero-text">
              <h3>{selectedCategory} Charts</h3>
              <p>{CATEGORIES.find(c => c.title === selectedCategory)?.desc}</p>
            </div>
          </div>

          <div className="mp-breadcrumb">
            <button className="mp-breadcrumb-link" onClick={handleBackToCategories}>
              ← Back to Categories
            </button>
          </div>

          <section>
            <div className="mp-section-head">
              <h4>All {selectedCategory} Templates ({getCategoryTemplates(selectedCategory).length})</h4>
              <button className="mp-action-secondary" onClick={handleClose}>Close</button>
            </div>

            <div className="mp-templates">
              {getCategoryTemplates(selectedCategory).map((tpl, idx) => (
                <button
                  key={idx}
                  className="mp-template"
                  onClick={() => onInstall({
                    ...tpl,
                    source: 'marketplace',
                    sampleData: {
                      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                      datasets: [{ label: tpl.name, data: [10, 20, 15, 25] }]
                    },
                    config: { options: {} }
                  })}
                  title={`Add ${tpl.name}`}
                >
                  <div className="mp-template-preview" aria-hidden="true">
                    {tpl.type === 'bar' && '📊'}
                    {tpl.type === 'line' && '📈'}
                    {tpl.type === 'pie' && '🥧'}
                    <div className="mp-chart-type">{tpl.type.toUpperCase()}</div>
                  </div>
                  <div className="mp-template-meta">
                    <div className="mp-template-name">{tpl.name}</div>
                    <div className="mp-template-sub">{tpl.category}</div>
                  </div>
                  <span className="mp-template-add">✨ Add</span>
                </button>
              ))}
            </div>

            {getCategoryTemplates(selectedCategory).length === 0 && (
              <div className="mp-empty-state">
                <div className="mp-empty-icon">🎨</div>
                <h4>No templates yet</h4>
                <p>This category is perfect for custom charts. Use our AI or custom builder to create something unique!</p>
                <div className="mp-actions">
                  <button className="mp-action-secondary" onClick={() => window.open('/charts/custom', '_blank')}>
                    🎨 Custom Builder
                  </button>
                  <button className="mp-action-primary" onClick={() => window.open('/charts/builder?mode=advanced', '_blank')}>
                    ✨ AI Chart Builder
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </Modal>
  );
}
