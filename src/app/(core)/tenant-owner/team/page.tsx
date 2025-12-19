"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Shield,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Edit,
  Trash2
} from "lucide-react";
import "./team.css";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  performanceScore: number;
  salesThisMonth: number;
  joinDate: string;
  avatar?: string;
}

interface TeamSummary {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  avgPerformance: number;
}

function TeamManagementPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSummary, setTeamSummary] = useState<TeamSummary>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    avgPerformance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'sales_representative',
    department: 'Sales'
  });

  useRibbonPage({
    context: "dashboard",
    enable: [
      "quickActions",
      "bulkOps",
      "export",
      "profile",
      "notifications",
      "theme",
      "language"
    ],
    disable: []
  });

  // Redirect non-owners
  useEffect(() => {
    if (!loading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch team data
  useEffect(() => {
    async function fetchTeamData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/team/members");
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.members || []);
          setTeamSummary(data.summary || {
            totalMembers: 0,
            activeMembers: 0,
            pendingMembers: 0,
            avgPerformance: 0
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch team data');
          console.error('Team API error:', errorData);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'owner') {
      fetchTeamData();
    }
  }, [user]);

  // Close more actions dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreActions) {
        const target = event.target as Element;
        if (!target.closest('.actions-container')) {
          setShowMoreActions(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMoreActions]);

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role.toLowerCase().includes(filterRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
      case 'inactive':
        return <AlertCircle size={16} style={{ color: '#ef4444' }} />;
      case 'pending':
        return <Clock size={16} style={{ color: '#fbbf24' }} />;
      default:
        return <AlertCircle size={16} style={{ color: '#9ca3af' }} />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  // Action handlers
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
    setShowMoreActions(null); // Close more actions if open
  };

  const handleContactMember = (member: TeamMember) => {
    // Open default email client with member's email
    const subject = encodeURIComponent(`GhostCRM - Contact from ${user?.email || 'Team Lead'}`);
    const body = encodeURIComponent(`Hello ${member.name.split(' ')[0]},\n\nI hope this email finds you well.\n\nBest regards,\n${user?.email || 'Team Lead'}`);
    window.location.href = `mailto:${member.email}?subject=${subject}&body=${body}`;
    setShowMoreActions(null); // Close more actions if open
  };

  const handleMoreActions = (memberId: string) => {
    setShowMoreActions(showMoreActions === memberId ? null : memberId);
  };

  const saveEditedMember = async () => {
    if (!selectedMember) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/team/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedMember.name,
          email: selectedMember.email,
          role: selectedMember.role,
          department: selectedMember.department,
          status: selectedMember.status
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Member updated successfully:', result);
        
        // Update local state
        setTeamMembers(prev => prev.map(member => 
          member.id === selectedMember.id ? selectedMember : member
        ));
        
        setShowEditModal(false);
        setSelectedMember(null);
        
        // Refresh data
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update member:', errorData);
        alert(`Failed to update member: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating member:', error);
      alert('Error updating member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateMember = async (member: TeamMember) => {
    try {
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/team/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...member,
          status: newStatus
        }),
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to ${newStatus === 'active' ? 'activate' : 'deactivate'} member: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('Error updating member status. Please try again.');
    }
    setShowMoreActions(null);
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (confirm(`Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/team/members/${member.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh data
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(`Failed to remove member: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error removing member. Please try again.');
      }
    }
    setShowMoreActions(null);
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Member invited successfully:', result);
        
        // Reset form
        setNewMember({
          name: '',
          email: '',
          role: 'sales_representative',
          department: 'Sales'
        });
        
        setShowAddMember(false);
        
        // Show success message with invite details
        alert(`✅ Invitation sent successfully!\n\nInvite URL: ${result.member.inviteUrl}\n\nNote: In a production environment, this would be sent via email.`);
        
        // Refresh data
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to invite member:', errorData);
        alert(`Failed to send invitation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error inviting member:', error);
      alert('Error sending invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="team-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="text-white">Loading team management...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-page">
        <div className="error-container">
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Error Loading Team Data</h2>
          <p style={{ color: '#d1d5db', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <div className="team-page">
      <div className="team-container">
        {/* Header */}
        <div className="header-glass">
          <div className="header-content">
            <div className="header-left">
              <div className="header-title-section">
                <div className="header-icon">
                  <Users size={24} />
                </div>
                <h1 className="header-title">Team Management</h1>
              </div>
              <p className="header-subtitle">Manage your dealership staff and performance</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowAddMember(true)}
                className="btn-primary"
              >
                <UserPlus size={18} />
                Add Team Member
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <h3>{teamSummary.totalMembers}</h3>
                <p>Total Team Members</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-details">
                <h3>{teamSummary.activeMembers}</h3>
                <p>Active Members</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon purple">
                <TrendingUp size={24} />
              </div>
              <div className="stat-details">
                <h3>{teamSummary.avgPerformance}%</h3>
                <p>Avg Performance</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon yellow">
                <Clock size={24} />
              </div>
              <div className="stat-details">
                <h3>{teamSummary.pendingMembers}</h3>
                <p>Pending Invites</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-filter-content">
            <div className="search-input-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="manager">Managers</option>
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="team-table-container">
          <div className="table-header">
            <h3 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              margin: '0',
              padding: '24px'
            }}>Team Members</h3>
          </div>
          
          <table className="team-table">
            <thead className="table-header">
              <tr>
                <th>Member</th>
                <th>Role & Department</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Sales This Month</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="table-row">
                  <td>
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="member-details">
                        <h4>{member.name}</h4>
                        <p>{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className={`role-badge role-${member.role.toLowerCase().replace(/\s+/g, '-')}`}>
                        {member.role}
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                        {member.department}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className={`status-badge status-${member.status}`}>
                      <div className={`pulse-dot ${member.status === 'active' ? 'green' : member.status === 'inactive' ? 'red' : 'yellow'}`}></div>
                      {member.status}
                    </div>
                  </td>
                  <td>
                    <div className="performance-score">
                      <span className={`performance-number ${
                        member.performanceScore >= 90 ? 'performance-excellent' :
                        member.performanceScore >= 80 ? 'performance-good' : 'performance-poor'
                      }`}>
                        {member.performanceScore}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'white', fontWeight: '600' }}>
                      {member.salesThisMonth}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                      {member.lastActivity}
                    </span>
                  </td>
                  <td>
                    <div className="actions-container">
                      <button 
                        className="action-button" 
                        title="Edit Member"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-button" 
                        title="Contact Member"
                        onClick={() => handleContactMember(member)}
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        className="action-button" 
                        title="More Actions"
                        onClick={() => handleMoreActions(member.id)}
                        style={{
                          background: showMoreActions === member.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {/* More Actions Dropdown */}
                      {showMoreActions === member.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: '0',
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          padding: '8px',
                          minWidth: '160px',
                          zIndex: 100,
                          marginTop: '4px'
                        }}>
                          <button
                            onClick={() => handleDeactivateMember(member)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fbbf24',
                              fontSize: '14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}
                            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)')}
                            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
                          >
                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)')}
                            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
                          >
                            Remove from Team
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              width: '500px',
              color: 'white'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
                color: 'white'
              }}>Invite Team Member</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="sales_representative" style={{ background: '#1f2937', color: 'white' }}>Sales Representative</option>
                    <option value="sales_manager" style={{ background: '#1f2937', color: 'white' }}>Sales Manager</option>
                    <option value="finance_manager" style={{ background: '#1f2937', color: 'white' }}>Finance Manager</option>
                    <option value="service_advisor" style={{ background: '#1f2937', color: 'white' }}>Service Advisor</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Department
                  </label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Sales" style={{ background: '#1f2937', color: 'white' }}>Sales</option>
                    <option value="Finance" style={{ background: '#1f2937', color: 'white' }}>Finance</option>
                    <option value="Service" style={{ background: '#1f2937', color: 'white' }}>Service</option>
                    <option value="Management" style={{ background: '#1f2937', color: 'white' }}>Management</option>
                    <option value="General" style={{ background: '#1f2937', color: 'white' }}>General</option>
                  </select>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '20px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#fbbf24', fontSize: '13px', margin: '0' }}>
                  💡 <strong>Note:</strong> An invitation will be sent to the email address above. In production, this would be sent automatically. For now, you'll see the invite link to share manually.
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMember({
                      name: '',
                      email: '',
                      role: 'sales_representative',
                      department: 'Sales'
                    });
                  }}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={isSubmitting || !newMember.name.trim() || !newMember.email.trim()}
                  style={{
                    padding: '10px 20px',
                    background: isSubmitting || !newMember.name.trim() || !newMember.email.trim() ? 
                      'rgba(96, 165, 250, 0.4)' : 'rgba(96, 165, 250, 0.8)',
                    border: '1px solid rgba(96, 165, 250, 0.9)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isSubmitting || !newMember.name.trim() || !newMember.email.trim() ? 
                      'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditModal && selectedMember && (
          <div style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              width: '500px',
              color: 'white',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '24px',
                color: 'white'
              }}>Edit Team Member</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedMember.name}
                    onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedMember.email}
                    onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Role
                  </label>
                  <select
                    value={selectedMember.role}
                    onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="owner" style={{ background: '#1f2937', color: 'white' }}>Owner</option>
                    <option value="sales_manager" style={{ background: '#1f2937', color: 'white' }}>Sales Manager</option>
                    <option value="sales_representative" style={{ background: '#1f2937', color: 'white' }}>Sales Representative</option>
                    <option value="finance_manager" style={{ background: '#1f2937', color: 'white' }}>Finance Manager</option>
                    <option value="service_advisor" style={{ background: '#1f2937', color: 'white' }}>Service Advisor</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f3f4f6', fontSize: '14px', fontWeight: '500' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedMember.department}
                    onChange={(e) => setSelectedMember({ ...selectedMember, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMember(null);
                  }}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedMember}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: isSubmitting ? 'rgba(96, 165, 250, 0.4)' : 'rgba(96, 165, 250, 0.8)',
                    border: '1px solid rgba(96, 165, 250, 0.9)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamManagement() {
  return (
    <I18nProvider>
      <ToastProvider>
        <TeamManagementPage />
      </ToastProvider>
    </I18nProvider>
  );
}