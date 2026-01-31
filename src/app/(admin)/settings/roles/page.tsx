"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Save,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Database,
  FileText,
  UserCheck,
  Clock,
  Calendar,
  Building2,
  UserPlus,
  UserMinus,
  AlertCircle
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSystemLevel: boolean;
  requiresApproval: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  department: string;
  level: 'junior' | 'standard' | 'senior' | 'lead' | 'manager' | 'admin';
  permissions: string[];
  isSystemRole: boolean;
  isCustom: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface UserRoleAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  isTemporary: boolean;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
}

interface CreateRoleForm {
  name: string;
  description: string;
  department: string;
  level: 'junior' | 'standard' | 'senior' | 'lead' | 'manager' | 'admin';
  permissions: string[];
}

interface AssignRoleForm {
  userId: string;
  roleId: string;
  temporary: boolean;
  expiresAt: string;
}

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [departments, setDepartments] = useState<string[]>([]);
  const [levels] = useState(['junior', 'standard', 'senior', 'lead', 'manager', 'admin']);

  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: '',
    description: '',
    department: '',
    level: 'standard',
    permissions: []
  });

  const [assignForm, setAssignForm] = useState<AssignRoleForm>({
    userId: '',
    roleId: '',
    temporary: false,
    expiresAt: ''
  });

  // Load data on mount
  useEffect(() => {
    loadRoles();
    loadAssignments();
    loadAvailableUsers();
  }, []);

  const loadRoles = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedLevel) params.append('level', selectedLevel);
      params.append('includePermissions', 'true');

      const response = await fetch(`/api/settings/roles?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setRoles(result.data.roles);
        setPermissions(result.data.permissions);
        setDepartments(result.data.departments);
      } else {
        setError(result.error || 'Failed to load roles');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/settings/roles/assignments');
      const result = await response.json();
      
      if (result.success) {
        setAssignments(result.data.assignments);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch('/api/settings/roles/assignments?available=true');
      const result = await response.json();
      
      if (result.success) {
        setAvailableUsers(result.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const createRole = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRoles([...roles, result.data]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          department: '',
          level: 'standard',
          permissions: []
        });
      } else {
        setError(result.error || 'Failed to create role');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, ...updates })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRoles(roles.map(role => 
          role.id === roleId ? result.data : role
        ));
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRoles(roles.filter(role => role.id !== roleId));
      } else {
        setError(result.error || 'Failed to delete role');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const assignRole = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/roles/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAssignments([...assignments, result.data]);
        setShowAssignModal(false);
        setAssignForm({
          userId: '',
          roleId: '',
          temporary: false,
          expiresAt: ''
        });
        // Update role user count
        setRoles(roles.map(role => 
          role.id === assignForm.roleId 
            ? { ...role, userCount: role.userCount + 1 }
            : role
        ));
      } else {
        setError(result.error || 'Failed to assign role');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const revokeRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to revoke this role assignment?')) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/roles/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAssignments(assignments.filter(assignment => 
          !(assignment.userId === userId && assignment.roleId === roleId)
        ));
        // Update role user count
        setRoles(roles.map(role => 
          role.id === roleId 
            ? { ...role, userCount: Math.max(0, role.userCount - 1) }
            : role
        ));
      } else {
        setError(result.error || 'Failed to revoke role');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      junior: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      senior: 'bg-green-100 text-green-800',
      lead: 'bg-yellow-100 text-yellow-800',
      manager: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPermissionsByCategory = () => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    
    return grouped;
  };

  // Filter roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = !searchQuery || 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || role.department === selectedDepartment;
    const matchesLevel = !selectedLevel || role.level === selectedLevel;
    
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Roles & Permissions</h1>
        <p className="text-gray-600">
          Manage user roles, permissions, and access control across your organization
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'roles', name: 'Roles', icon: Shield },
            { id: 'assignments', name: 'User Assignments', icon: UserCheck },
            { id: 'permissions', name: 'Permission Matrix', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          {/* Header with search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </button>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      {role.isSystemRole && !role.isCustom && (
                        <span title="System Role">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </span>
                      )}
                      {role.isCustom && (
                        <span title="Custom Role">
                          <Settings className="w-4 h-4 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {role.department}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(role.level)}`}>
                        {role.level.charAt(0).toUpperCase() + role.level.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Permissions</span>
                    <span>{role.permissions.length} assigned</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((role.permissions.length / permissions.length) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {role.userCount} users
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(role.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Role Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowPermissionsModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Permissions
                  </button>
                  
                  {role.isCustom && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setCreateForm({
                            name: role.name,
                            description: role.description,
                            department: role.department,
                            level: role.level,
                            permissions: role.permissions
                          });
                          setShowCreateModal(true);
                        }}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedDepartment || selectedLevel
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first custom role'
                }
              </p>
              {!searchQuery && !selectedDepartment && !selectedLevel && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* User Assignments Tab */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Role Assignments</h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <UserPlus className="w-4 h-4" />
              Assign Role
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.userName}</div>
                          <div className="text-sm text-gray-500">{assignment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.roleName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                        {assignment.isTemporary && assignment.expiresAt && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(assignment.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : assignment.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => revokeRole(assignment.userId, assignment.roleId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Tab */}
      {activeTab === 'permissions' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Permission Matrix</h2>
          
          {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-900">{category}</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryPermissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              {permission.requiresApproval && (
                                <span title="Requires Approval">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                </span>
                              )}
                              {permission.isSystemLevel && (
                                <span title="System Level">
                                  <Crown className="w-4 h-4 text-red-500" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{permission.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {permission.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {permission.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              permission.isSystemLevel 
                                ? 'bg-red-100 text-red-800' 
                                : permission.requiresApproval
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {permission.isSystemLevel ? 'System' : permission.requiresApproval ? 'Approval' : 'Standard'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter role name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({...createForm, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Role description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={createForm.level}
                  onChange={(e) => setCreateForm({...createForm, level: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="space-y-1">
                        {categoryPermissions.map(permission => (
                          <label key={permission.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={createForm.permissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCreateForm({
                                    ...createForm, 
                                    permissions: [...createForm.permissions, permission.id]
                                  });
                                } else {
                                  setCreateForm({
                                    ...createForm,
                                    permissions: createForm.permissions.filter(p => p !== permission.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="flex-1">{permission.name}</span>
                            {permission.requiresApproval && (
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            )}
                            {permission.isSystemLevel && (
                              <Crown className="w-3 h-3 text-red-500" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRole(null);
                  setCreateForm({
                    name: '',
                    description: '',
                    department: '',
                    level: 'standard',
                    permissions: []
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={selectedRole ? () => updateRole(selectedRole.id, createForm) : createRole}
                disabled={saving || !createForm.name || !createForm.department || !createForm.description}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {selectedRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Role to User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({...assignForm, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a user</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                <select
                  value={assignForm.roleId}
                  onChange={(e) => setAssignForm({...assignForm, roleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.department})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignForm.temporary}
                    onChange={(e) => setAssignForm({...assignForm, temporary: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">Temporary assignment</span>
                </label>
              </div>
              
              {assignForm.temporary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <input
                    type="datetime-local"
                    value={assignForm.expiresAt}
                    onChange={(e) => setAssignForm({...assignForm, expiresAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignForm({
                    userId: '',
                    roleId: '',
                    temporary: false,
                    expiresAt: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={assignRole}
                disabled={saving || !assignForm.userId || !assignForm.roleId || (assignForm.temporary && !assignForm.expiresAt)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Permissions for {selectedRole.name}</h2>
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedRole(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => {
                const rolePermissions = categoryPermissions.filter(p => selectedRole.permissions.includes(p.id));
                if (rolePermissions.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                    <div className="space-y-2">
                      {rolePermissions.map(permission => (
                        <div key={permission.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium text-green-900">{permission.name}</div>
                            <div className="text-sm text-green-700">{permission.description}</div>
                          </div>
                          {permission.requiresApproval && (
                            <span title="Requires Approval">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            </span>
                          )}
                          {permission.isSystemLevel && (
                            <span title="System Level">
                              <Crown className="w-4 h-4 text-red-500" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesAndPermissions;
