'use client';

import { Settings, TrendingUp, Building2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import './QuickActions.css';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'purple' | 'green';
  href?: string;
  onClick?: () => void;
}

export function QuickActions() {
  const actions: ActionItem[] = [
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Manage global system configuration',
      icon: Settings,
      color: 'blue',
      href: '/owner/settings'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed platform analytics',
      icon: TrendingUp,
      color: 'purple',
      href: '/owner/analytics'
    },
    {
      id: 'tenants',
      title: 'Tenant Management',
      description: 'Add and manage tenant organizations',
      icon: Building2,
      color: 'green',
      href: '/owner/tenants'
    }
  ];

  const handleActionClick = (action: ActionItem) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      // For now, just log - can add navigation later
      console.log(`Navigate to: ${action.href}`);
    }
  };

  return (
    <div className="quick-actions-section">
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions-grid">
        {actions.map(action => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={action.id}
              className="action-card"
              onClick={() => handleActionClick(action)}
            >
              <div className="action-header">
                <div className={`action-icon ${action.color}`}>
                  <IconComponent className="icon" />
                </div>
                <ChevronRight className="chevron" />
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}