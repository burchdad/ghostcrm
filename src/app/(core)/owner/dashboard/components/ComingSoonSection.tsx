'use client';

import { Calendar, MessageSquare, BarChart } from 'lucide-react';
import './ComingSoonSection.css';

interface ComingSoonItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'purple' | 'green';
}

export function ComingSoonSection() {
  const comingSoonItems: ComingSoonItem[] = [
    {
      id: 'scheduling',
      title: 'Advanced Scheduling',
      description: 'AI-powered meeting coordination',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'messaging',
      title: 'Smart Messaging',
      description: 'Automated conversation insights',
      icon: MessageSquare,
      color: 'purple'
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'Machine learning forecasts',
      icon: BarChart,
      color: 'green'
    }
  ];

  return (
    <div className="coming-soon-section">
      <h2 className="section-title">Coming Soon</h2>
      <div className="coming-soon-container">
        <div className="coming-soon-grid">
          {comingSoonItems.map(item => {
            const IconComponent = item.icon;
            return (
              <div key={item.id} className="coming-soon-card">
                <div className={`coming-soon-icon ${item.color}`}>
                  <IconComponent className="icon" />
                </div>
                <div className="coming-soon-content">
                  <h3 className="coming-soon-title">{item.title}</h3>
                  <p className="coming-soon-description">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}