"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  User, 
  Users, 
  Filter, 
  ArrowRight,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Calendar
} from "lucide-react";

interface AssignRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  priority: number;
  conditions: RuleCondition[];
  assignment: RuleAssignment;
  createdAt: string;
  lastModified: string;
  leadsAssigned: number;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'lead_field' | 'lead_score' | 'source' | 'geography' | 'time' | 'custom';
}

interface RuleAssignment {
  type: 'user' | 'team' | 'round_robin' | 'load_balance';
  assignTo?: string[];
  teamId?: string;
  method?: string;
}

interface Team {
  id: string;
  name: string;
  members: number;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  currentLoad: number;
  maxCapacity: number;
}

export default function AssignRulesPage() {
  const [rules, setRules] = useState<AssignRule[]>([
    {
      id: '1',
      name: 'High-Value Leads to Senior Reps',
      description: 'Assign leads with budget >$50k to senior sales reps',
      status: 'active',
      priority: 1,
      conditions: [
        { id: '1', field: 'budget', operator: 'greater_than', value: '50000', type: 'lead_field' },
        { id: '2', field: 'lead_score', operator: 'greater_than', value: '80', type: 'lead_score' }
      ],
      assignment: {
        type: 'user',
        assignTo: ['sarah-johnson', 'michael-chen']
      },
      createdAt: '2024-09-15',
      lastModified: '2024-10-10',
      leadsAssigned: 145
    },
    {
      id: '2',
      name: 'Geographic Assignment - West Coast',
      description: 'Route west coast leads to regional team',
      status: 'active',
      priority: 2,
      conditions: [
        { id: '1', field: 'state', operator: 'in', value: 'CA,OR,WA,NV', type: 'geography' }
      ],
      assignment: {
        type: 'team',
        teamId: 'west-coast-team'
      },
      createdAt: '2024-08-20',
      lastModified: '2024-10-05',
      leadsAssigned: 287
    },
    {
      id: '3',
      name: 'Round Robin - General Leads',
      description: 'Distribute general leads evenly among available reps',
      status: 'active',
      priority: 3,
      conditions: [
        { id: '1', field: 'lead_score', operator: 'between', value: '40-79', type: 'lead_score' }
      ],
      assignment: {
        type: 'round_robin',
        assignTo: ['david-wilson', 'lisa-rodriguez', 'james-anderson']
      },
      createdAt: '2024-07-10',
      lastModified: '2024-09-25',
      leadsAssigned: 512
    },
    {
      id: '4',
      name: 'After Hours Assignment',
      description: 'Route leads received outside business hours',
      status: 'inactive',
      priority: 4,
      conditions: [
        { id: '1', field: 'created_time', operator: 'outside_hours', value: '9-17', type: 'time' }
      ],
      assignment: {
        type: 'user',
        assignTo: ['night-shift-rep']
      },
      createdAt: '2024-06-15',
      lastModified: '2024-08-30',
      leadsAssigned: 89
    }
  ]);

  const [teams] = useState<Team[]>([
    { id: 'west-coast-team', name: 'West Coast Sales', members: 5, description: 'Regional sales team for western states' },
    { id: 'enterprise-team', name: 'Enterprise Sales', members: 3, description: 'High-value enterprise accounts' },
    { id: 'inbound-team', name: 'Inbound Sales', members: 8, description: 'General inbound lead handling' }
  ]);

  const [users] = useState<User[]>([
    { id: 'sarah-johnson', name: 'Sarah Johnson', email: 'sarah@dealership.com', role: 'Senior Sales Rep', isActive: true, currentLoad: 15, maxCapacity: 25 },
    { id: 'michael-chen', name: 'Michael Chen', email: 'michael@dealership.com', role: 'Senior Sales Rep', isActive: true, currentLoad: 18, maxCapacity: 25 },
    { id: 'david-wilson', name: 'David Wilson', email: 'david@dealership.com', role: 'Sales Rep', isActive: true, currentLoad: 12, maxCapacity: 20 },
    { id: 'lisa-rodriguez', name: 'Lisa Rodriguez', email: 'lisa@dealership.com', role: 'Sales Rep', isActive: true, currentLoad: 8, maxCapacity: 20 },
    { id: 'james-anderson', name: 'James Anderson', email: 'james@dealership.com', role: 'Sales Rep', isActive: false, currentLoad: 0, maxCapacity: 20 }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('rules');

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' };
      }
      return rule;
    }));
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-600 bg-red-100';
    if (priority <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getLoadPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Assignment Rules</h1>
          <p className="text-gray-600 mt-1">Automate lead distribution based on conditions and criteria</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Rule
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignment Rules ({rules.length})
          </button>
          <button
            onClick={() => setSelectedTab('teams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setSelectedTab('reps')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'reps'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales Reps ({users.length})
          </button>
        </nav>
      </div>

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rule.priority)}`}>
                      Priority {rule.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{rule.description}</p>
                  
                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Conditions:</h4>
                    <div className="space-y-2">
                      {rule.conditions.map((condition, index) => (
                        <div key={condition.id} className="flex items-center gap-2 text-sm text-gray-600">
                          {index > 0 && <span className="text-blue-600 font-medium">AND</span>}
                          <span className="bg-gray-100 px-2 py-1 rounded">{condition.field}</span>
                          <span>{condition.operator}</span>
                          <span className="bg-blue-100 px-2 py-1 rounded">{condition.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Assignment:</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="capitalize">{rule.assignment.type.replace('_', ' ')}</span>
                      <ArrowRight size={16} />
                      {rule.assignment.assignTo && (
                        <span>{rule.assignment.assignTo.length} rep(s)</span>
                      )}
                      {rule.assignment.teamId && (
                        <span>Team: {teams.find(t => t.id === rule.assignment.teamId)?.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-sm text-gray-500">
                    <span>{rule.leadsAssigned} leads assigned</span>
                    <span className="mx-2">•</span>
                    <span>Modified {rule.lastModified}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {rule.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {selectedTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{team.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{team.members} members</span>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Manage Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sales Reps Tab */}
      {selectedTab === 'reps' && (
        <div className="space-y-4">
          {users.map((user) => {
            const loadPercentage = getLoadPercentage(user.currentLoad, user.maxCapacity);
            return (
              <div key={user.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Current Load */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current Load</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {user.currentLoad}/{user.maxCapacity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLoadColor(loadPercentage)}`}>
                          {loadPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {user.isActive ? (
                          <>
                            <CheckCircle size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Assignment Rule</h2>
            
            <form className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1">1 - Highest</option>
                    <option value="2">2 - High</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - Low</option>
                    <option value="5">5 - Lowest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Describe when this rule should apply"
                />
              </div>

              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="user">Assign to Specific User(s)</option>
                  <option value="team">Assign to Team</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="load_balance">Load Balance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}