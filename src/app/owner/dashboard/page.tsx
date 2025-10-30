"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  Users, 
  Database, 
  Server, 
  Activity, 
  Shield, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  LogOut,
  RefreshCw,
  Download,
  Search,
  Ticket
} from 'lucide-react';

interface SystemMetrics {
  totalUsers: number;
  activeTenants: number;
  totalRevenue: number;
  systemUptime: number;
  apiCalls24h: number;
  errorRate: number;
}

interface TenantData {
  id: string;
  name: string;
  userCount: number;
  status: 'active' | 'suspended' | 'trial';
  lastActivity: string;
  revenue: number;
  plan: string;
}

interface SecurityAlert {
  id: string;
  type: 'security' | 'compliance' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

interface NewPromoCode {
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showEditPromo, setShowEditPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Verify owner session
    const ownerSession = localStorage.getItem('ownerSession');
    if (!ownerSession) {
      router.push('/owner/login');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In production, these would be real API calls with owner authentication
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      // Mock system metrics
      setSystemMetrics({
        totalUsers: 1247,
        activeTenants: 34,
        totalRevenue: 89650,
        systemUptime: 99.97,
        apiCalls24h: 156789,
        errorRate: 0.03
      });

      // Mock tenant data
      setTenants([
        {
          id: 'tenant-1',
          name: 'Acme Corporation',
          userCount: 156,
          status: 'active',
          lastActivity: new Date().toISOString(),
          revenue: 5940,
          plan: 'Enterprise'
        },
        {
          id: 'tenant-2', 
          name: 'Tech Innovations LLC',
          userCount: 89,
          status: 'active',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          revenue: 2970,
          plan: 'Professional'
        },
        {
          id: 'tenant-3',
          name: 'Startup Ventures',
          userCount: 23,
          status: 'trial',
          lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          revenue: 0,
          plan: 'Trial'
        }
      ]);

      // Mock security alerts
      setSecurityAlerts([
        {
          id: 'alert-1',
          type: 'security',
          severity: 'medium',
          message: 'Unusual login pattern detected from IP 192.168.1.100',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'compliance',
          severity: 'low',
          message: 'GDPR compliance check completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ]);

      // Load promo codes from API
      await loadPromoCodes();

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async () => {
    try {
      const response = await fetch('/api/owner/promo-codes', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPromoCodes(data.promoCodes);
          console.log('✅ Loaded promo codes from API');
        }
      } else {
        console.log('⚠️ Using fallback promo codes');
        // Fallback to mock data if API fails
        setPromoCodes([
          {
            id: 'promo-1',
            code: 'TESTCLIENT70',
            description: 'Special discount for first test client - $70/month',
            discountType: 'fixed',
            discountValue: 70,
            monthlyPrice: 70,
            yearlyPrice: 840,
            maxUses: 1,
            usedCount: 0,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'Software Owner'
          },
          {
            id: 'promo-2',
            code: 'SOFTWAREOWNER',
            description: 'Free access for software owner testing',
            discountType: 'percentage',
            discountValue: 100,
            monthlyPrice: 0,
            yearlyPrice: 0,
            maxUses: 1,
            usedCount: 0,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'Software Owner'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    }
  };

  const createPromoCode = async (newPromo: NewPromoCode) => {
    try {
      const response = await fetch('/api/owner/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPromo)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload promo codes from API to get the latest data
        await loadPromoCodes();
        console.log('✅ Promo code created successfully');
        return true;
      } else {
        console.error('Failed to create promo code:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      return false;
    }
  };

  const updatePromoCode = async (updatedPromo: PromoCode) => {
    try {
      const response = await fetch('/api/owner/promo-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedPromo)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload promo codes from API to get the latest data
        await loadPromoCodes();
        console.log('✅ Promo code updated successfully');
        return true;
      } else {
        console.error('Failed to update promo code:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
      return false;
    }
  };

  const deletePromoCode = async (promoId: string) => {
    try {
      const response = await fetch(`/api/owner/promo-codes?id=${promoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload promo codes from API to get the latest data
        await loadPromoCodes();
        console.log('✅ Promo code deleted successfully');
        return true;
      } else {
        console.error('Failed to delete promo code:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return false;
    }
  };

  const handleEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setShowEditPromo(true);
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    if (window.confirm(`Are you sure you want to delete the promo code "${promo.code}"? This action cannot be undone.`)) {
      await deletePromoCode(promo.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerSession');
    router.push('/owner/login');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-violet-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold">Owner Control Center</h1>
                <p className="text-purple-200 text-sm">Maximum Privilege Access</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadDashboardData()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'System Overview', icon: Activity },
              { id: 'tenants', label: 'Tenant Management', icon: Users },
              { id: 'promo-codes', label: 'Promo Codes', icon: Ticket },
              { id: 'security', label: 'Security Center', icon: Shield },
              { id: 'settings', label: 'System Settings', icon: Settings }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.activeTenants}</p>
                  </div>
                  <Database className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${systemMetrics?.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.systemUptime}%</p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Calls (24h)</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.apiCalls24h.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{systemMetrics?.errorRate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Recent Security Alerts */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {securityAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.resolved ? 
                            <CheckCircle className="w-4 h-4" /> : 
                            <AlertTriangle className="w-4 h-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTenants.map(tenant => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant.userCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${tenant.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.lastActivity).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'promo-codes' && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Promo Code Management</h2>
                <p className="text-gray-600 mt-1">Create and manage promotional codes for special pricing</p>
              </div>
              <button
                onClick={() => setShowCreatePromo(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Create Promo Code
              </button>
            </div>

            {/* Promo Codes List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="space-y-4">
                  {promoCodes.map(promo => (
                    <div key={promo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-md">
                              {promo.code}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              promo.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {promo.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {promo.usedCount}/{promo.maxUses} uses
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2">{promo.description}</p>
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                            <span>
                              Pricing: ${promo.monthlyPrice}/month or ${promo.yearlyPrice}/year
                            </span>
                            <span>
                              Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditPromo(promo)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePromo(promo)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Promo Code Modal */}
            {showCreatePromo && (
              <CreatePromoCodeModal 
                onClose={() => setShowCreatePromo(false)}
                onSave={async (newPromo) => {
                  const success = await createPromoCode(newPromo);
                  if (success) {
                    setShowCreatePromo(false);
                  }
                  return success;
                }}
              />
            )}

            {/* Edit Promo Code Modal */}
            {showEditPromo && editingPromo && (
              <EditPromoCodeModal 
                promo={editingPromo}
                onClose={() => {
                  setShowEditPromo(false);
                  setEditingPromo(null);
                }}
                onSave={async (updatedPromo) => {
                  const success = await updatePromoCode(updatedPromo);
                  if (success) {
                    setShowEditPromo(false);
                    setEditingPromo(null);
                  }
                  return success;
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Center</h3>
            <p className="text-gray-600">Security monitoring and compliance tools will be displayed here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration and settings will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Create Promo Code Modal Component
interface CreatePromoCodeModalProps {
  onClose: () => void;
  onSave: (promoCode: NewPromoCode) => Promise<boolean>;
}

interface EditPromoCodeModalProps {
  promo: PromoCode;
  onClose: () => void;
  onSave: (promoCode: PromoCode) => Promise<boolean>;
}

function CreatePromoCodeModal({ onClose, onSave }: CreatePromoCodeModalProps) {
  const [formData, setFormData] = useState<NewPromoCode>({
    code: '',
    description: '',
    discountType: 'fixed',
    discountValue: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUses: 1,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return;
    
    setSaving(true);
    
    try {
      // Convert date string to ISO string
      const promoData = {
        ...formData,
        expiresAt: new Date(formData.expiresAt).toISOString()
      };
      
      const success = await onSave(promoData);
      if (!success) {
        // Handle error - could show toast notification
        console.error('Failed to create promo code');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof NewPromoCode, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Create Promo Code</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Promo Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              placeholder="TESTCLIENT70"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Special discount for first test client"
              rows={3}
              required
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="fixed">Fixed Price</option>
              <option value="percentage">Percentage Off</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price ($)
              </label>
              <input
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yearly Price ($)
              </label>
              <input
                type="number"
                value={formData.yearlyPrice}
                onChange={(e) => handleInputChange('yearlyPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => handleInputChange('maxUses', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Activate immediately
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Promo Code'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPromoCodeModal({ promo, onClose, onSave }: EditPromoCodeModalProps) {
  const [formData, setFormData] = useState<PromoCode>(promo);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const success = await onSave(formData);
      if (!success) {
        alert('Failed to update promo code. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Promo Code</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., TESTCLIENT70"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Brief description of this promo code"
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyPrice || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.yearlyPrice || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Uses
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : ''
                }))}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                disabled={saving}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="edit-isActive" className="text-sm text-gray-700">
                Active (users can apply this promo code)
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                'Update Promo Code'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}