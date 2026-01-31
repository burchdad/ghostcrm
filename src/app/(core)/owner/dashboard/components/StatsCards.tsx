'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Building2, BarChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import './StatsCards.css';

interface StatsData {
  totalTenants: number;
  activeUsers: number;
  revenue: number;
  growthRate: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalTenants: 0,
    activeUsers: 0,
    revenue: 24500,
    growthRate: 12.5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalTenants: 8,
        activeUsers: 145,
        revenue: 24500,
        growthRate: 12.5
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="stats-section">
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="stat-card loading">
              <div className="loading-shimmer"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Total Tenants</p>
              <p className="stat-value">{stats.totalTenants}</p>
            </div>
            <div className="stat-icon blue">
              <Building2 className="icon" />
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Active Users</p>
              <p className="stat-value">{stats.activeUsers}</p>
            </div>
            <div className="stat-icon green">
              <Users className="icon" />
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Revenue</p>
              <p className="stat-value">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="stat-icon purple">
              <TrendingUp className="icon" />
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Growth Rate</p>
              <p className="stat-value">+{stats.growthRate}%</p>
            </div>
            <div className="stat-icon orange">
              <BarChart className="icon" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}