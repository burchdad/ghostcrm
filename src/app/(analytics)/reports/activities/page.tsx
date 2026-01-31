"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  Users, 
  Phone, 
  Mail, 
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";
import { generateActivityData, generateTeamData, generateActivityBreakdown } from "@/lib/mockDataGenerators";

interface ActivityMetrics {
  totalActivities: number;
  completed: number;
  pending: number;
  overdue: number;
  avgDuration: number;
  completionRate: number;
  topPerformer: string;
}

interface ActivityData {
  date: string;
  calls: number;
  emails: number;
  meetings: number;
  tasks: number;
  total: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  totalActivities: number;
  completed: number;
  pending: number;
  completionRate: number;
  avgResponseTime: number;
}

interface ActivityBreakdown {
  type: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

const mockMetrics: ActivityMetrics = {
  totalActivities: 2847,
  completed: 2156,
  pending: 531,
  overdue: 160,
  avgDuration: 28,
  completionRate: 75.7,
  topPerformer: "Sarah Johnson"
};

// Generate data dynamically to reduce bundle size
const mockActivityData = generateActivityData(30);
const mockTeamData = generateTeamData(5);
const mockBreakdown = generateActivityBreakdown();

export default function ActivitiesReportPage() {
  const [dateRange, setDateRange] = useState('last7days');
  const [activityType, setActivityType] = useState('all');
  const [teamMember, setTeamMember] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  const exportReport = () => {
    // Generate CSV content
    const headers = ['Date', 'Calls', 'Emails', 'Meetings', 'Tasks', 'Total'];
    const csvContent = [
      headers.join(','),
      ...mockActivityData.map(row => 
        [row.date, row.calls, row.emails, row.meetings, row.tasks, row.total].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activities Report</h1>
            <p className="text-gray-600">Comprehensive analysis of sales activities and team performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thismonth">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activities</option>
            <option value="calls">Calls</option>
            <option value="emails">Emails</option>
            <option value="meetings">Meetings</option>
            <option value="tasks">Tasks</option>
          </select>
          <select
            value={teamMember}
            onChange={(e) => setTeamMember(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Team Members</option>
            {mockTeamData.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalActivities.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{mockMetrics.completed.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{mockMetrics.pending.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{mockMetrics.overdue.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-900">{mockMetrics.completionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Avg Duration</p>
              <p className="text-2xl font-bold text-indigo-900">{mockMetrics.avgDuration}m</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Activity Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="calls" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="emails" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="meetings" stackId="1" stroke="#EF4444" fill="#EF4444" />
              <Area type="monotone" dataKey="tasks" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockBreakdown}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ type, percentage }) => `${type}: ${percentage}%`}
              >
                {mockBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mockBreakdown.map(item => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.type}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Team Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Activities</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Completed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Pending</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Response Time</th>
              </tr>
            </thead>
            <tbody>
              {mockTeamData.map((member, index) => (
                <tr key={member.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.role}</td>
                  <td className="py-3 px-4 font-medium">{member.totalActivities}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-medium">{member.completed}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-yellow-600 font-medium">{member.pending}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${member.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{member.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900">{member.avgResponseTime}h</span>
                      {member.avgResponseTime < 3 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
