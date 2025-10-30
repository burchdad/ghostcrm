'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  ExternalLink,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  Settings,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  Activity 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subdomain {
  id: string;
  subdomain: string;
  fullDomain: string;
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  status: 'pending' | 'active' | 'failed' | 'suspended';
  healthStatus: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  sslStatus: 'pending' | 'active' | 'failed' | 'expired';
  createdAt: string;
  lastHealthCheck?: string;
  dnsRecordCount: number;
  customDomain?: string;
}

interface SubdomainStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  suspended: number;
  healthy: number;
  unhealthy: number;
}

interface SubdomainManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubdomainManager({ isOpen, onClose }: SubdomainManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [stats, setStats] = useState<SubdomainStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    subdomain: '',
    organizationId: '',
    organizationName: '',
    ownerEmail: '',
    customDomain: '',
    autoProvision: true
  });
  const [creating, setCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSubdomains();
    }
  }, [isOpen, page, statusFilter, searchTerm]);

  const loadSubdomains = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        search: searchTerm,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/subdomains/manage?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubdomains(data.data);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load subdomains',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subdomains',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.subdomain || !createForm.organizationId || !createForm.organizationName || !createForm.ownerEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/subdomains/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Subdomain '${data.subdomain}' created successfully!`,
        });
        
        // Reset form
        setCreateForm({
          subdomain: '',
          organizationId: '',
          organizationName: '',
          ownerEmail: '',
          customDomain: '',
          autoProvision: true
        });
        setSuggestions([]);
        
        // Switch to list tab and reload
        setActiveTab('list');
        loadSubdomains();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create subdomain',
          variant: 'destructive'
        });
        
        // Show suggestions if available
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create subdomain',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const updateSubdomainStatus = async (subdomainId: string, status: string) => {
    try {
      const response = await fetch('/api/subdomains/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomainId,
          updates: { status }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Subdomain status updated to ${status}`,
        });
        loadSubdomains();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subdomain status',
        variant: 'destructive'
      });
    }
  };

  const deleteSubdomain = async (subdomainId: string, action: 'suspend' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} this subdomain?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/subdomains/manage?id=${subdomainId}&action=${action}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        loadSubdomains();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} subdomain`,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500', label: 'Active' },
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      failed: { color: 'bg-red-500', label: 'Failed' },
      suspended: { color: 'bg-gray-500', label: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      healthy: { icon: CheckCircle, color: 'text-green-500', label: 'Healthy' },
      unhealthy: { icon: AlertCircle, color: 'text-red-500', label: 'Unhealthy' },
      degraded: { icon: AlertCircle, color: 'text-yellow-500', label: 'Degraded' },
      unknown: { icon: Clock, color: 'text-gray-500', label: 'Unknown' }
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.unknown;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subdomain Management"
      width="min(1200px, 92vw)"
      maxHeight="90vh"
    >
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Subdomains</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-600">Active</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.unhealthy}</div>
              <div className="text-sm text-red-600">Issues</div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'create')}>
          <TabsList>
            <TabsTrigger value="list">Manage Subdomains</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subdomains, organizations, or emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadSubdomains} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Subdomains Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subdomain</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Loading subdomains...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : subdomains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No subdomains found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subdomains.map((subdomain) => (
                      <TableRow key={subdomain.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subdomain.subdomain}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {subdomain.fullDomain}
                              <ExternalLink 
                                className="h-3 w-3 cursor-pointer hover:text-blue-500" 
                                onClick={() => window.open(`https://${subdomain.fullDomain}`, '_blank')}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subdomain.organizationName}</div>
                            <div className="text-sm text-gray-500">{subdomain.ownerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(subdomain.status)}</TableCell>
                        <TableCell>{getHealthBadge(subdomain.healthStatus)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(subdomain.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {subdomain.status === 'suspended' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSubdomainStatus(subdomain.id, 'active')}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSubdomainStatus(subdomain.id, 'suspended')}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSubdomain(subdomain.id, 'delete')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total} subdomains
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain *</Label>
                  <Input
                    id="subdomain"
                    placeholder="acme"
                    value={createForm.subdomain}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                    required
                  />
                  <div className="text-sm text-gray-500">
                    Will create: {createForm.subdomain || 'subdomain'}.ghostcrm.ai
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationId">Organization ID *</Label>
                  <Input
                    id="organizationId"
                    placeholder="org_123456789"
                    value={createForm.organizationId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, organizationId: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="Acme Corporation"
                    value={createForm.organizationName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, organizationName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Owner Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@acme.com"
                    value={createForm.ownerEmail}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    placeholder="crm.acme.com"
                    value={createForm.customDomain}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customDomain: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Auto Provision DNS</Label>
                  <Select 
                    value={createForm.autoProvision.toString()} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, autoProvision: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes - Auto provision</SelectItem>
                      <SelectItem value="false">No - Manual setup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-2">Subdomain not available. Try these suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateForm(prev => ({ ...prev, subdomain: suggestion }))}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Subdomain
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}