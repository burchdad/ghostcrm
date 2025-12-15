"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Package, AlertTriangle, TrendingUp, Eye, Edit, Users, Car } from "lucide-react";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";

export default function TenantSalesManagerInventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_MANAGER_INVENTORY] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "inventory",
    enable: ["bulkOps", "quickActions", "export", "share", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  // State management
  const [inventory, setInventory] = useState<any[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);

  // Check if user has proper access
  if (user && !['admin', 'manager'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // Fetch inventory and assignment data
  useEffect(() => {
    async function fetchInventory() {
      try {
        // Fetch real inventory data for sales manager
        try {
          const response = await fetch('/api/inventory/manager', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setInventory(data?.inventory || []);
            setTeamAssignments(data?.teamAssignments || []);
            console.log('✅ [INVENTORY MANAGER] Successfully fetched data');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error('❌ [INVENTORY MANAGER] Failed to fetch data:', error);
          setInventory([]);
          setTeamAssignments([]);
          toast({
            title: "Error Loading Inventory",
            description: "Unable to load inventory and assignment data.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        setInventory([]);
        setTeamAssignments([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInventory();
  }, []);

  // Filter inventory based on search
  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assigned_rep?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate analytics
  const analytics = {
    totalVehicles: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    assignedVehicles: inventory.filter(item => item.assigned_rep).length,
    hotLeads: inventory.reduce((sum, item) => sum + (item.leads_interested || 0), 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'available': { class: 'bg-green-100 text-green-800', text: 'Available' },
      'low_stock': { class: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' },
      'sold_out': { class: 'bg-red-100 text-red-800', text: 'Sold Out' },
      'reserved': { class: 'bg-blue-100 text-blue-800', text: 'Reserved' }
    };
    return badges[status] || { class: 'bg-gray-100 text-gray-800', text: status };
  };

  const handleAssignVehicle = (vehicleId: number) => {
    toast({
      title: "Vehicle Assignment",
      description: "Vehicle assignment feature will be available soon.",
    });
  };

  const handleViewDetails = (vehicleId: number) => {
    router.push(`/tenant-salesmanager/inventory/${vehicleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage vehicle assignments and monitor team performance</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? 'Cancel Bulk' : 'Bulk Assign'}
          </Button>
          <Button onClick={() => router.push('/tenant-salesmanager/inventory/assign')}>
            <Users className="w-4 h-4 mr-2" />
            Assign Vehicles
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold">{analytics.totalVehicles}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold">{analytics.assignedVehicles}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold">{analytics.hotLeads}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Assignments Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Team Vehicle Assignments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamAssignments.map((assignment, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">{assignment.rep}</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Vehicles: {assignment.vehicles}</p>
                <p>Active Leads: {assignment.active_leads}</p>
                <p>Pending: {assignment.pending_deliveries}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vehicles by name, SKU, category, or assigned rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {bulkMode && selectedIdxs.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {}}>
                Assign to Rep ({selectedIdxs.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => {}}>
                Update Status
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <EmptyStateComponent
          type="general"
          title="No Vehicles Found"
          description="No vehicles match your search criteria or none are available."
          actionLabel="View All Inventory"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {bulkMode && <TableHead className="w-12"></TableHead>}
                <TableHead>Vehicle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Rep</TableHead>
                <TableHead>Lead Interest</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((vehicle, index) => (
                <TableRow key={vehicle.id}>
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
                  <TableCell>
                    <div>
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">SKU: {vehicle.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.category}</TableCell>
                  <TableCell>{vehicle.quantity}</TableCell>
                  <TableCell>{formatCurrency(vehicle.price)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(vehicle.status).class}`}>
                      {getStatusBadge(vehicle.status).text}
                    </span>
                  </TableCell>
                  <TableCell>
                    {vehicle.assigned_rep ? (
                      <span className="text-blue-600 font-medium">{vehicle.assigned_rep}</span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.leads_interested > 5 ? 'bg-red-100 text-red-800' :
                      vehicle.leads_interested > 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {vehicle.leads_interested} leads
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(vehicle.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAssignVehicle(vehicle.id)}>
                        <Users className="w-4 h-4" />
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