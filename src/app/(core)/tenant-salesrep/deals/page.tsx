"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  MessageSquare, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  User,
  Car,
  Clock,
  Target
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim: string;
    vin?: string;
    price: number;
  };
  status: 'lead' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  lastActivity: string;
  nextFollowUp?: string;
  notes: string;
  assignedTo: string;
  createdDate: string;
  updatedDate: string;
  source: string;
}

export default function TenantSalesRepDealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_REP_DEALS] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  useRibbonPage({
    context: "sales",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  // Check if user has proper access
  if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, statusFilter]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      
      // Mock personal deals for sales rep
      const mockDeals: Deal[] = [
        {
          id: '1',
          customerName: 'Jennifer Martinez',
          customerEmail: 'j.martinez@email.com',
          customerPhone: '(555) 123-4567',
          vehicleInfo: {
            year: 2024,
            make: 'Honda',
            model: 'Accord',
            trim: 'EX',
            vin: '1HGCY1F30PA123456',
            price: 32500
          },
          status: 'closed-won',
          stage: 'Delivery Scheduled',
          value: 32500,
          probability: 100,
          expectedCloseDate: '2024-01-25',
          lastActivity: '2 hours ago',
          nextFollowUp: '2024-01-25',
          notes: 'Customer very satisfied. Delivery scheduled for Friday.',
          assignedTo: user ? user.email.split('@')[0] : 'Sales Rep',
          createdDate: '2024-01-15',
          updatedDate: '2024-01-22',
          source: 'Website'
        },
        {
          id: '2',
          customerName: 'Robert Chen',
          customerEmail: 'r.chen@email.com',
          customerPhone: '(555) 987-6543',
          vehicleInfo: {
            year: 2024,
            make: 'Toyota',
            model: 'Camry',
            trim: 'LE',
            price: 29800
          },
          status: 'negotiation',
          stage: 'Price Negotiation',
          value: 29800,
          probability: 75,
          expectedCloseDate: '2024-01-30',
          lastActivity: '4 hours ago',
          nextFollowUp: '2024-01-23',
          notes: 'Customer interested but wants better financing terms.',
          assignedTo: user ? user.email.split('@')[0] : 'Sales Rep',
          createdDate: '2024-01-18',
          updatedDate: '2024-01-22',
          source: 'Referral'
        },
        {
          id: '3',
          customerName: 'Sarah Williams',
          customerEmail: 's.williams@email.com',
          customerPhone: '(555) 456-7890',
          vehicleInfo: {
            year: 2024,
            make: 'Nissan',
            model: 'Altima',
            trim: 'SR',
            price: 27200
          },
          status: 'proposal',
          stage: 'Proposal Sent',
          value: 27200,
          probability: 60,
          expectedCloseDate: '2024-02-05',
          lastActivity: '1 day ago',
          nextFollowUp: '2024-01-24',
          notes: 'Sent detailed proposal with financing options.',
          assignedTo: user ? user.email.split('@')[0] : 'Sales Rep',
          createdDate: '2024-01-20',
          updatedDate: '2024-01-21',
          source: 'Walk-in'
        },
        {
          id: '4',
          customerName: 'Michael Johnson',
          customerEmail: 'm.johnson@email.com',
          customerPhone: '(555) 234-5678',
          vehicleInfo: {
            year: 2024,
            make: 'Ford',
            model: 'F-150',
            trim: 'XLT',
            price: 45200
          },
          status: 'qualified',
          stage: 'Needs Analysis',
          value: 45200,
          probability: 40,
          expectedCloseDate: '2024-02-10',
          lastActivity: '2 days ago',
          nextFollowUp: '2024-01-23',
          notes: 'Qualified lead, needs truck for business. Scheduled test drive.',
          assignedTo: user ? user.email.split('@')[0] : 'Sales Rep',
          createdDate: '2024-01-21',
          updatedDate: '2024-01-21',
          source: 'Phone Inquiry'
        },
        {
          id: '5',
          customerName: 'Lisa Thompson',
          customerEmail: 'l.thompson@email.com',
          customerPhone: '(555) 345-6789',
          vehicleInfo: {
            year: 2024,
            make: 'Subaru',
            model: 'Outback',
            trim: 'Limited',
            price: 36800
          },
          status: 'contacted',
          stage: 'Initial Contact',
          value: 36800,
          probability: 25,
          expectedCloseDate: '2024-02-15',
          lastActivity: '3 days ago',
          nextFollowUp: '2024-01-23',
          notes: 'First-time buyer, needs financing assistance.',
          assignedTo: user ? user.email.split('@')[0] : 'Sales Rep',
          createdDate: '2024-01-19',
          updatedDate: '2024-01-19',
          source: 'Social Media'
        }
      ];

      setDeals(mockDeals);
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = deals;

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.vehicleInfo.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    setFilteredDeals(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-emerald-100 text-emerald-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.lead;
  };

  const handleDealClick = (dealId: string) => {
    router.push(`/tenant-salesrep/deals/${dealId}`);
  };

  const handleContactCustomer = (deal: Deal, type: 'call' | 'email' | 'text') => {
    switch (type) {
      case 'call':
        window.location.href = `tel:${deal.customerPhone}`;
        break;
      case 'email':
        window.location.href = `mailto:${deal.customerEmail}`;
        break;
      case 'text':
        // SMS functionality would be implemented here
        toast({
          title: "SMS Feature",
          description: "SMS functionality would open here",
        });
        break;
    }
  };

  const getPipelineValue = () => {
    return deals.reduce((total, deal) => {
      if (deal.status !== 'closed-lost') {
        return total + (deal.value * deal.probability / 100);
      }
      return total;
    }, 0);
  };

  const getDealsWon = () => {
    return deals.filter(deal => deal.status === 'closed-won').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline and customer relationships</p>
        </div>
        <Button onClick={() => router.push('/tenant-salesrep/deals/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${getPipelineValue().toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Deals Won</p>
              <p className="text-2xl font-bold text-gray-900">{getDealsWon()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Follow-ups Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.nextFollowUp).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search deals by customer name or vehicle..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="lead">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>
      </Card>

      {/* Deals Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 cursor-pointer">
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{deal.customerName}</div>
                        <div className="text-sm text-gray-500">{deal.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {deal.vehicleInfo.year} {deal.vehicleInfo.make} {deal.vehicleInfo.model}
                    </div>
                    <div className="text-sm text-gray-500">{deal.vehicleInfo.trim}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deal.status)}`}>
                      {deal.stage}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    <div className="font-medium">${deal.value.toLocaleString()}</div>
                    <div className="text-gray-500">{deal.probability}% probability</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    {deal.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactCustomer(deal, 'call');
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactCustomer(deal, 'email');
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactCustomer(deal, 'text');
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredDeals.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start by adding your first deal."}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Button
                className="mt-4"
                onClick={() => router.push('/tenant-salesrep/deals/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Deal
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}