'use client';

import { useAuth } from '@/contexts/auth-context';
import './DashboardHeader.css';

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.email}</p>
        </div>
        <div className="header-actions">
          <button className="analytics-button">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}