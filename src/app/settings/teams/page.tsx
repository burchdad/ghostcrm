"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Eye,
  Settings,
  Mail,
  Building2,
  Calendar,
  Clock,
  Check,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Lock,
  Unlock,
  UserCheck
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  leaderId: string;
  memberCount: number;
  members: TeamMember[];
  permissions: string[];
  settings: {
    isPrivate: boolean;
    allowSelfJoin: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateTeamForm {
  name: string;
  description: string;
  department: string;
  leaderId: string;
  isPrivate: boolean;
  allowSelfJoin: boolean;
  requireApproval: boolean;
  maxMembers: number;
}

interface AddMemberForm {
  userId: string;
  role: string;
  permissions: string[];
}

const TeamsManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

  const [createForm, setCreateForm] = useState<CreateTeamForm>({
    name: '',
    description: '',
    department: '',
    leaderId: '',
    isPrivate: false,
    allowSelfJoin: true,
    requireApproval: false,
    maxMembers: 20
  });

  const [memberForm, setMemberForm] = useState<AddMemberForm>({
    userId: '',
    role: '',
    permissions: []
  });

  // Load teams and metadata
  useEffect(() => {
    loadTeams();
    loadAvailableData();
  }, []);

  const loadTeams = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDepartment) params.append('department', selectedDepartment);
      params.append('includeMembers', 'true');

      const response = await fetch(`/api/settings/teams?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setTeams(result.data);
        setDepartments(result.departments);
      } else {
        setError(result.error || 'Failed to load teams');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableData = async () => {
    try {
      const response = await fetch('/api/settings/teams/members?available=true');
      const result = await response.json();
      
      if (result.success) {
        setAvailableUsers(result.data.users);
        setAvailableRoles(result.data.roles);
        setAvailablePermissions(result.data.permissions);
      }
    } catch (err) {
      console.error('Failed to load available data:', err);
    }
  };

  const createTeam = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTeams([...teams, result.data]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          department: '',
          leaderId: '',
          isPrivate: false,
          allowSelfJoin: true,
          requireApproval: false,
          maxMembers: 20
        });
      } else {
        setError(result.error || 'Failed to create team');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, ...updates })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTeams(teams.map(team => 
          team.id === teamId ? result.data : team
        ));
        setShowEditModal(false);
        setSelectedTeam(null);
      } else {
        setError(result.error || 'Failed to update team');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTeams(teams.filter(team => team.id !== teamId));
      } else {
        setError(result.error || 'Failed to delete team');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!selectedTeam) return;

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamId: selectedTeam.id, 
          ...memberForm 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const updatedTeams = teams.map(team => 
          team.id === selectedTeam.id 
            ? { ...team, members: [...team.members, result.data], memberCount: team.memberCount + 1 }
            : team
        );
        setTeams(updatedTeams);
        setShowMemberModal(false);
        setMemberForm({ userId: '', role: '', permissions: [] });
        setSelectedTeam(null);
      } else {
        setError(result.error || 'Failed to add member');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/teams/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const updatedTeams = teams.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                members: team.members.filter(m => m.id !== userId),
                memberCount: team.memberCount - 1
              }
            : team
        );
        setTeams(updatedTeams);
      } else {
        setError(result.error || 'Failed to remove member');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  // Filter teams based on search and department
  const filteredTeams = teams.filter(team => {
    const matchesSearch = !searchQuery || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || team.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
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
        <h1 className="text-3xl font-bold mb-2">Teams Management</h1>
        <p className="text-gray-600">
          Create and manage teams, assign members and configure permissions
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

      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teams..."
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
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  {team.settings.isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {team.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.memberCount} members
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Team Members Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Members</h4>
              <div className="flex items-center gap-2">
                {team.members.slice(0, 4).map((member, idx) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
                    title={member.name}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {team.memberCount > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">
                    +{team.memberCount - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Team Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTeam(team);
                  setShowMemberModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
              
              <button
                onClick={() => {
                  setSelectedTeam(team);
                  setShowEditModal(true);
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit Team"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => deleteTeam(team.id)}
                className="px-3 py-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Team"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedDepartment 
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first team'
            }
          </p>
          {!searchQuery && !selectedDepartment && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Team description"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value) || 20})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({...createForm, isPrivate: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Private team</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.allowSelfJoin}
                    onChange={(e) => setCreateForm({...createForm, allowSelfJoin: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Allow self-join</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.requireApproval}
                    onChange={(e) => setCreateForm({...createForm, requireApproval: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Require approval to join</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={createTeam}
                disabled={saving || !createForm.name || !createForm.department}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Member to {selectedTeam.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={memberForm.userId}
                  onChange={(e) => setMemberForm({...memberForm, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a user</option>
                  {availableUsers
                    .filter(user => !selectedTeam.members.find(m => m.id === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({...memberForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select role</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {availablePermissions.map(permission => (
                    <label key={permission} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={memberForm.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMemberForm({
                              ...memberForm, 
                              permissions: [...memberForm.permissions, permission]
                            });
                          } else {
                            setMemberForm({
                              ...memberForm,
                              permissions: memberForm.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedTeam(null);
                  setMemberForm({ userId: '', role: '', permissions: [] });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                disabled={saving || !memberForm.userId || !memberForm.role}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsManagement;