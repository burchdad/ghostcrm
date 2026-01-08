"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Package, AlertTriangle, TrendingUp, Eye, Edit, Trash2, QrCode } from "lucide-react";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import QRCodeModal from "@/components/inventory/QRCodeModal";
import VehicleDetailModal from "@/components/modals/VehicleDetailModal";
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import "./page.css";

export default function TenantOwnerInventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_OWNER_INVENTORY] Access denied - redirecting");
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
  const [loading, setLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState('Your Organization');
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [vehicleDetailOpen, setVehicleDetailOpen] = useState(false);

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // Fetch inventory data
  useEffect(() => {
    async function fetchInventory() {
      try {
        // Fetch organization data for proper name display
        const organizationRes = await fetch('/api/organization').catch(() => null);
        if (organizationRes && organizationRes.ok) {
          const orgData = await organizationRes.json();
          if (orgData?.organization?.name) {
            setOrganizationName(orgData.organization.name);
          }
        }
        
        // Fetch real inventory data from API
        try {
          const inventoryResponse = await fetch('/api/inventory', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            setInventory(inventoryData?.data || []);
            console.log('✅ [INVENTORY] Successfully fetched inventory data:', inventoryData?.data?.length || 0, 'items');
          } else {
            throw new Error(`HTTP error! status: ${inventoryResponse.status}`);
          }
        } catch (inventoryError) {
          console.error('❌ [INVENTORY] Failed to fetch inventory:', inventoryError);
          setInventory([]);
          toast({
            title: "Error Loading Inventory",
            description: "Unable to load inventory data. Please refresh the page or contact support.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        setInventory([]);
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
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle row click to open vehicle details
  const handleVehicleClick = (vehicle: any) => {
    console.log("🚗 [VEHICLE] Opening vehicle details for:", vehicle);
    setSelectedVehicle(vehicle);
    setVehicleDetailOpen(true);
  };

  const handleVehicleUpdated = async () => {
    // Refresh inventory data after vehicle update
    try {
      const response = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data?.data || []);
        console.log('🔄 [INVENTORY] Data refreshed after vehicle update');
      }
    } catch (error) {
      console.error('❌ [INVENTORY] Failed to refresh data:', error);
    }
  };

  const handleVehicleDeleted = async () => {
    // Refresh inventory data after vehicle deletion
    try {
      const response = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data?.data || []);
        console.log('🗑️ [INVENTORY] Data refreshed after vehicle deletion');
        
        toast({
          title: "Vehicle Deleted",
          description: "The vehicle has been successfully removed from inventory.",
        });
      }
    } catch (error) {
      console.error('❌ [INVENTORY] Failed to refresh data after deletion:', error);
      // Still remove from local state as fallback
      if (selectedVehicle) {
        setInventory(prev => prev.filter(item => item.id !== selectedVehicle.id));
      }
    }
  };

  const handlePrintQRCode = (item: any) => {
    console.log("🔍 [QR CODE] Button clicked, item:", item);
    console.log("🔍 [QR CODE] Setting selectedVehicle and opening modal");
    console.log("🔍 [QR CODE] Current qrModalOpen state:", qrModalOpen);
    console.log("🔍 [QR CODE] Current selectedVehicle state:", selectedVehicle);
    
    // Use setTimeout to ensure state updates are processed properly
    setTimeout(() => {
      // Open QR code configuration modal
      setSelectedVehicle(item);
      setQrModalOpen(true);
      
      console.log("🔍 [QR CODE] After setState calls");
      
      toast({
        title: "QR Code Manager",
        description: "Configure QR code features and settings.",
      });
    }, 10);
  };

  // Calculate analytics
  const analytics = {
    totalItems: inventory.reduce((sum, item) => sum + (item.stock_available || 0), 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.total_value || 0), 0),
    lowStock: inventory.filter(item => item.availability_status === 'Low Stock' || item.stock_available <= (item.stock_reorder_level || 5)).length,
    outOfStock: inventory.filter(item => item.availability_status === 'Out of Stock' || item.stock_available === 0).length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'in_stock': { class: 'status-in-stock', text: 'In Stock' },
      'low_stock': { class: 'status-low-stock', text: 'Low Stock' },
      'out_of_stock': { class: 'status-out-stock', text: 'Out of Stock' }
    };
    return badges[status] || { class: 'status-unknown', text: status };
  };

  if (loading) {
    return (
      <div className="tenant-owner-inventory-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-cards">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
          <div className="skeleton-table"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-owner-inventory-page">
      {/* Header with Analytics Grid */}
      <div className="tenant-owner-inventory-header">
        <div className="tenant-owner-inventory-header-content">
          {/* Analytics Grid Header with 4-column layout */}
          <div className="tenant-owner-inventory-analytics-grid-header">
            <div className="tenant-owner-inventory-analytics-card total">
              <div className="tenant-owner-inventory-card-header">
                <span className="tenant-owner-inventory-card-label">TOTAL ITEMS</span>
                <div className="tenant-owner-inventory-card-icon total">
                  <Package />
                </div>
              </div>
              <div className="tenant-owner-inventory-card-value">{analytics.totalItems}</div>
              <div className="tenant-owner-inventory-card-trend">
                <TrendingUp />
                {inventory.length} unique products
              </div>
            </div>

            <div className="tenant-owner-inventory-analytics-card value">
              <div className="tenant-owner-inventory-card-header">
                <span className="tenant-owner-inventory-card-label">INVENTORY VALUE</span>
                <div className="tenant-owner-inventory-card-icon value">
                  <TrendingUp />
                </div>
              </div>
              <div className="tenant-owner-inventory-card-value">{formatCurrency(analytics.totalValue)}</div>
              <div className="tenant-owner-inventory-card-trend">
                <TrendingUp />
                Total asset value
              </div>
            </div>

            <div className="tenant-owner-inventory-analytics-card low-stock">
              <div className="tenant-owner-inventory-card-header">
                <span className="tenant-owner-inventory-card-label">LOW STOCK</span>
                <div className="tenant-owner-inventory-card-icon low-stock">
                  <AlertTriangle />
                </div>
              </div>
              <div className="tenant-owner-inventory-card-value">{analytics.lowStock}</div>
              <div className="tenant-owner-inventory-card-trend">
                <AlertTriangle />
                Needs attention
              </div>
            </div>

            <div className="tenant-owner-inventory-analytics-card out-stock">
              <div className="tenant-owner-inventory-card-header">
                <span className="tenant-owner-inventory-card-label">OUT OF STOCK</span>
                <div className="tenant-owner-inventory-card-icon out-stock">
                  <AlertTriangle />
                </div>
              </div>
              <div className="tenant-owner-inventory-card-value">{analytics.outOfStock}</div>
              <div className="tenant-owner-inventory-card-trend">
                <AlertTriangle />
                Immediate action needed
              </div>
            </div>
          </div>

          {/* AI Assistant Section */}
          <div className="tenant-owner-inventory-ai-assistant-section">
            <PageAIAssistant 
              agentId="inventory"
              pageTitle="Inventory Management"
              entityData={{
                totalVehicles: inventory.length,
                totalValue: inventory.reduce((sum, v) => sum + (v.price || 0), 0),
                avgDaysOnLot: Math.round(inventory.reduce((sum, v) => sum + (v.daysOnLot || 0), 0) / Math.max(inventory.length, 1)),
                slowMovers: inventory.filter(v => (v.daysOnLot || 0) > 60).length
              }}
              className="tenant-owner-inventory-ai-assistant"
            />
          </div>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="tenant-owner-inventory-content-wrapper">
        <div className="tenant-owner-inventory-content">
          {/* Enhanced Search and Controls */}
          <div className="tenant-owner-inventory-controls">
            <div className="tenant-owner-inventory-search-row">
              <div className="tenant-owner-inventory-search-container">
                <Search className="tenant-owner-inventory-search-icon" />
                <Input
                  placeholder="Search inventory by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tenant-owner-inventory-search-input"
                />
              </div>
              
              <div className="tenant-owner-inventory-filters">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  onClick={() => setBulkMode(!bulkMode)}
                  className="tenant-owner-inventory-bulk-mode-btn"
                >
                  Bulk Actions
                </Button>
                <Button 
                  onClick={() => router.push('/tenant-owner/new-inventory')}
                  className="tenant-owner-inventory-add-btn"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="tenant-owner-inventory-table-container">
            <Card className="tenant-owner-inventory-table-card">
          {filteredInventory.length === 0 ? (
            <EmptyStateComponent
              type="general"
              title="No inventory items found"
              description="Get started by adding your first inventory item or adjust your search filters."
              actionLabel="Add Item"
              onAction={() => {
                router.push('/tenant-owner/new-inventory');
              }}
            />
          ) : (
            <Table className="tenant-owner-inventory-table">
              <TableHeader>
                <TableRow>
                  {bulkMode && <TableHead>Select</TableHead>}
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item, index) => {
                  const statusBadge = getStatusBadge(item.status);
                  return (
                    <TableRow 
                      key={item.id || index} 
                      className="tenant-owner-inventory-row cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleVehicleClick(item)}
                    >
                      {bulkMode && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-mono">{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                      <TableCell>
                        <span className={`tenant-owner-inventory-status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="tenant-owner-inventory-action-btn qr-code"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handlePrintQRCode(item);
                          }}
                          title="Print QR Code (Patent Pending)"
                        >
                          <QrCode className="icon-sm" />
                        </Button>
                      </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
            )}
            </Card>
          </div>
        </div>
      </div>      {/* QR Code Management Modal */}
      <QRCodeModal 
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
      />

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal 
        isOpen={vehicleDetailOpen}
        onClose={() => {
          setVehicleDetailOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onVehicleUpdated={handleVehicleUpdated}
        onVehicleDeleted={handleVehicleDeleted}
      />
    </div>
  );
}