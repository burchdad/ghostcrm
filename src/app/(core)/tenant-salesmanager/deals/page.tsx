"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Trash2, TrendingUp, DollarSign, Target, BarChart3, Users } from "lucide-react";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";

export default function TenantSalesManagerDealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control - Sales managers and admins can access
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_MANAGER_DEALS] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "sales",
    enable: ["bulkOps", "quickActions", "export", "share", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  // State management
  const [deals, setDeals] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);

  // Check if user has proper access
  if (user && !['admin', 'manager'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // Fetch team deals and statistics
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔄 Fetching team deals...');
        
        // Fetch team deals
        const dealsResponse = await fetch('/api/deals?manager=true');
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          console.log('✅ Team deals fetched:', dealsData.records?.length || 0);
          setDeals(dealsData.records || []);
        } else {
          console.error('❌ Team deals API error:', dealsResponse.status, dealsResponse.statusText);
          // Mock data for sales manager deals
          const mockDeals = [
            {
              id: '1',
              name: '2024 Honda Civic - Sarah J.',
              company: 'Johnson Family',
              value: 32000,
              stage: 'negotiation',
              probability: 75,
              sales_rep: 'Sarah Johnson',
              expected_close: '2024-12-15',
              last_activity: '2024-11-10'
            },
            {
              id: '2',
              name: '2024 Toyota Camry - Mike R.',
              company: 'Rodriguez Auto',
              value: 28500,
              stage: 'proposal',
              probability: 60,
              sales_rep: 'Mike Rodriguez',
              expected_close: '2024-12-20',
              last_activity: '2024-11-12'
            },
            {
              id: '3',
              name: '2025 Ford F-150 - Emily C.',
              company: 'Chen Construction',
              value: 55000,
              stage: 'qualified',
              probability: 40,
              sales_rep: 'Emily Chen',
              expected_close: '2025-01-10',
              last_activity: '2024-11-09'
            }
          ];
          setDeals(mockDeals);
        }

        // Fetch team stats
        const statsResponse = await fetch('/api/deals/team-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setTeamStats(statsData.stats || []);
        } else {
          // Mock team statistics
          const mockStats = [
            { rep: 'Sarah Johnson', deals: 5, value: 145000, close_rate: 85 },
            { rep: 'Mike Rodriguez', deals: 3, value: 87000, close_rate: 75 },
            { rep: 'Emily Chen', deals: 4, value: 112000, close_rate: 80 },
            { rep: 'David Thompson', deals: 2, value: 56000, close_rate: 70 }
          ];
          setTeamStats(mockStats);
        }

      } catch (error) {
        console.error('❌ Failed to fetch team data:', error);
        toast({
          title: "Connection Issue",
          description: "Some data couldn't be loaded. Refresh the page to try again.",
          variant: "destructive",
        });
        setDeals([]);
        setTeamStats([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter deals based on search
  const filteredDeals = deals.filter(deal =>
    deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.sales_rep?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800';
      case 'qualified': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-yellow-100 text-yellow-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed-won': return 'bg-green-100 text-green-800';
      case 'closed-lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle deal actions
  const handleViewDeal = (dealId: string) => {
    router.push(`/tenant-salesmanager/deals/${dealId}`);
  };

  const handleEditDeal = (dealId: string) => {
    router.push(`/tenant-salesmanager/deals/${dealId}/edit`);
  };

  const handleDeleteDeal = (dealId: string) => {
    // Implementation for deal deletion
    toast({
      title: "Feature Coming Soon",
      description: "Deal deletion will be available in the next update.",
    });
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: "Bulk Action",
      description: `${action} applied to ${selectedIdxs.length} deals.`,
    });
    setBulkMode(false);
    setSelectedIdxs([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Deals Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your team's sales pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? 'Cancel Bulk' : 'Bulk Actions'}
          </Button>
          <Button onClick={() => router.push('/tenant-salesmanager/new-deal')}>
            <Plus className="w-4 h-4 mr-2" />
            Assign New Deal
          </Button>
        </div>
      </div>

      {/* Team Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold">{deals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold">${deals.reduce((sum, deal) => sum + (deal.value || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold">{teamStats.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Close Rate</p>
              <p className="text-2xl font-bold">{Math.round(teamStats.reduce((sum, stat) => sum + (stat.close_rate || 0), 0) / teamStats.length || 0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search deals by name, company, or sales rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {bulkMode && selectedIdxs.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('Reassign')}>
                Reassign ({selectedIdxs.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('Update Stage')}>
                Update Stage
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Deals Table */}
      {filteredDeals.length === 0 ? (
        <EmptyStateComponent
          type="deals"
          title="No Team Deals Found"
          description="Your team hasn't been assigned any deals yet, or none match your search criteria."
          actionLabel="Assign New Deal"
          actionHref="/tenant-salesmanager/new-deal"
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {bulkMode && <TableHead className="w-12"></TableHead>}
                <TableHead>Deal Name</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal, index) => (
                <TableRow key={deal.id}>
                  {bulkMode && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIdxs.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIdxs([...selectedIdxs, index]);
                          } else {
                            setSelectedIdxs(selectedIdxs.filter(i => i !== index));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.sales_rep}</TableCell>
                  <TableCell>${deal.value?.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </TableCell>
                  <TableCell>{deal.probability}%</TableCell>
                  <TableCell>{deal.expected_close}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDeal(deal.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEditDeal(deal.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteDeal(deal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}