"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Users,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CheckSquare,
  Square,
  RefreshCw
} from "lucide-react";

interface DataRecord {
  id: string;
  type: 'lead' | 'contact' | 'company' | 'deal' | 'activity';
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  status: string;
  created: string;
  lastModified: string;
  tags: string[];
  metadata: any;
}

const mockRecords: DataRecord[] = [
  {
    id: '1',
    type: 'lead',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    value: 15000,
    status: 'Hot',
    created: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-15T14:30:00Z',
    tags: ['demo-scheduled', 'high-priority'],
    metadata: { source: 'website', score: 85 }
  },
  {
    id: '2',
    type: 'contact',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 987-6543',
    company: 'Growth Inc',
    status: 'Active',
    created: '2024-01-14T09:15:00Z',
    lastModified: '2024-01-15T11:45:00Z',
    tags: ['customer', 'enterprise'],
    metadata: { department: 'Marketing', title: 'VP Marketing' }
  },
  {
    id: '3',
    type: 'company',
    name: 'Innovation Labs',
    email: 'contact@innovationlabs.com',
    phone: '+1 (555) 456-7890',
    value: 50000,
    status: 'Prospect',
    created: '2024-01-13T16:20:00Z',
    lastModified: '2024-01-15T09:30:00Z',
    tags: ['startup', 'saas'],
    metadata: { employees: 150, industry: 'Technology' }
  },
  {
    id: '4',
    type: 'deal',
    name: 'Q1 Enterprise License',
    company: 'Tech Corp',
    value: 75000,
    status: 'Negotiation',
    created: '2024-01-12T14:00:00Z',
    lastModified: '2024-01-15T16:15:00Z',
    tags: ['enterprise', 'annual-contract'],
    metadata: { stage: 'proposal', probability: 70 }
  },
  {
    id: '5',
    type: 'activity',
    name: 'Demo Call with John Smith',
    company: 'Tech Corp',
    status: 'Completed',
    created: '2024-01-15T14:00:00Z',
    lastModified: '2024-01-15T15:00:00Z',
    tags: ['demo', 'call'],
    metadata: { duration: 60, outcome: 'interested' }
  }
];

export default function ViewAllRecordsPage() {
  const [records, setRecords] = useState<DataRecord[]>(mockRecords);
  const [filteredRecords, setFilteredRecords] = useState<DataRecord[]>(mockRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = records;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof DataRecord];
        const bValue = b[sortConfig.key as keyof DataRecord];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredRecords(filtered);
  }, [records, searchQuery, filterType, filterStatus, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(recordId)) {
        newSelection.delete(recordId);
      } else {
        newSelection.add(recordId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const handleBulkDelete = () => {
    setRecords(prev => prev.filter(record => !selectedRecords.has(record.id)));
    setSelectedRecords(new Set());
  };

  const handleBulkExport = () => {
    const selectedData = records.filter(record => selectedRecords.has(record.id));
    const csvContent = convertToCSV(selectedData);
    downloadCSV(csvContent, 'selected-records.csv');
  };

  const convertToCSV = (data: DataRecord[]) => {
    const headers = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Value', 'Status', 'Created', 'Tags'];
    const rows = data.map(record => [
      record.id,
      record.type,
      record.name,
      record.email || '',
      record.phone || '',
      record.company || '',
      record.value || '',
      record.status,
      new Date(record.created).toLocaleDateString(),
      record.tags.join('; ')
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Users className="w-4 h-4 text-blue-600" />;
      case 'contact': return <Users className="w-4 h-4 text-green-600" />;
      case 'company': return <Building className="w-4 h-4 text-purple-600" />;
      case 'deal': return <DollarSign className="w-4 h-4 text-orange-600" />;
      case 'activity': return <Calendar className="w-4 h-4 text-gray-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hot': case 'active': case 'completed': return 'bg-green-100 text-green-800';
      case 'warm': case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'cold': case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'lost': case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Records</h1>
            <p className="text-gray-600">Comprehensive view of all your CRM data</p>
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
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button 
              onClick={() => downloadCSV(convertToCSV(filteredRecords), 'all-records.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">{records.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Leads</p>
                <p className="text-2xl font-bold text-green-900">
                  {records.filter(r => r.type === 'lead').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Companies</p>
                <p className="text-2xl font-bold text-purple-900">
                  {records.filter(r => r.type === 'company').length}
                </p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Deals</p>
                <p className="text-2xl font-bold text-orange-900">
                  {records.filter(r => r.type === 'deal').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedRecords.size}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="lead">Leads</option>
            <option value="contact">Contacts</option>
            <option value="company">Companies</option>
            <option value="deal">Deals</option>
            <option value="activity">Activities</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
            <option value="Active">Active</option>
            <option value="Prospect">Prospect</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedRecords.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedRecords.size} record(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExport}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4"
                  >
                    {selectedRecords.size === filteredRecords.length && filteredRecords.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Type
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Name
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Value</th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Status
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('created')}
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Created
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <button
                      onClick={() => handleSelectRecord(record.id)}
                      className="flex items-center justify-center w-4 h-4"
                    >
                      {selectedRecords.has(record.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(record.type)}
                      <span className="capitalize font-medium">{record.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{record.name}</div>
                      {record.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {record.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                          {record.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{record.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {record.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {record.email}
                        </div>
                      )}
                      {record.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {record.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {record.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{record.company}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {record.value && (
                      <span className="font-medium text-green-600">
                        ${record.value.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(record.created).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-600 hover:text-blue-600 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-green-600 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-900 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-12 text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}