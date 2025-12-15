"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
        
        // For now, using mock data since no inventory API exists yet
        const mockData = [
          { 
            id: 1, 
            name: "2024 Honda Civic", 
            sku: "HC2024001", 
            category: "Sedan", 
            quantity: 5, 
            price: 28500, 
            status: "in_stock", 
            location: "Lot A",
            year: "2024",
            make: "Honda", 
            model: "Civic",
            trim: "LX",
            vin: "1HGBH41JXMN109186"
          },
          { 
            id: 2, 
            name: "2024 Toyota Camry", 
            sku: "TC2024001", 
            category: "Sedan", 
            quantity: 8, 
            price: 32000, 
            status: "in_stock", 
            location: "Lot A",
            year: "2024",
            make: "Toyota", 
            model: "Camry",
            trim: "SE",
            vin: "4T1BE46K59U123456"
          },
          { 
            id: 3, 
            name: "2024 Ford F-150", 
            sku: "FF2024001", 
            category: "Truck", 
            quantity: 3, 
            price: 45000, 
            status: "low_stock", 
            location: "Lot B",
            year: "2024",
            make: "Ford", 
            model: "F-150",
            trim: "XLT",
            vin: "1FTEW1E51JFA12345"
          },
          { 
            id: 4, 
            name: "2024 Chevrolet Equinox", 
            sku: "CE2024001", 
            category: "SUV", 
            quantity: 0, 
            price: 35000, 
            status: "out_of_stock", 
            location: "Lot C",
            year: "2024",
            make: "Chevrolet", 
            model: "Equinox",
            trim: "LT",
            vin: "2GNAXKEV1L6123456"
          },
          { 
            id: 5, 
            name: "2024 BMW X3", 
            sku: "BX2024001", 
            category: "SUV", 
            quantity: 12, 
            price: 55000, 
            status: "in_stock", 
            location: "Premium Lot",
            year: "2024",
            make: "BMW", 
            model: "X3",
            trim: "xDrive30i",
            vin: "5UX23DU06N9123456"
          }
        ];
        setInventory(mockData);
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

  // Action handlers for inventory items
  const handleViewItem = (item: any) => {
    // Show detailed view in a toast/modal for now
    // TODO: Create dedicated view page at /tenant-owner/inventory/[id]
    toast({
      title: `${item.name} Details`,
      description: `SKU: ${item.sku} | Category: ${item.category} | Quantity: ${item.quantity} | Price: ${formatCurrency(item.price)} | Location: ${item.location}`,
      duration: 5000,
    });
  };

  const handleEditItem = (item: any) => {
    // Navigate to new-inventory page with edit query params
    // TODO: Create dedicated edit page at /tenant-owner/inventory/edit/[id]
    toast({
      title: "Edit Feature",
      description: `Editing ${item.name} - This will redirect to edit form (coming soon)`,
      duration: 3000,
    });
    
    // For now, you could redirect to new-inventory with query params
    // router.push(`/tenant-owner/new-inventory?edit=${item.id}&sku=${item.sku}`);
  };

  const handleDeleteItem = async (item: any) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
      try {
        // Here you would call your delete API
        // await fetch(`/api/inventory/${item.id}`, { method: 'DELETE' });
        
        // For now, remove from state (mock deletion)
        setInventory(prev => prev.filter(inv => inv.id !== item.id));
        
        toast({
          title: "Item Deleted",
          description: `${item.name} has been removed from inventory.`,
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Unable to delete item. Please try again.",
          variant: "destructive"
        });
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
    totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
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
      {/* Analytics Cards Grid with AI Assistant */}
      <div className="tenant-owner-inventory-header">
        <div className="tenant-owner-inventory-header-content">
          <div className="tenant-owner-inventory-top-section">
            {/* Metrics in 2x2 Grid */}
            <div className="tenant-owner-inventory-metrics-container">
              <div className="tenant-owner-inventory-analytics-grid">
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
            </div>

            {/* AI Assistant aligned to the right */}
            <div className="tenant-owner-inventory-ai-container">
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
      </div>

      {/* Scrollable Content Container */}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item, index) => {
                  const statusBadge = getStatusBadge(item.status);
                  return (
                    <TableRow key={item.id || index} className="tenant-owner-inventory-row">
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
                    <TableCell>
                      <div className="tenant-owner-inventory-action-buttons">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="tenant-owner-inventory-action-btn view"
                          onClick={() => handleViewItem(item)}
                          title="View Details"
                        >
                          <Eye className="icon-sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="tenant-owner-inventory-action-btn edit"
                          onClick={() => handleEditItem(item)}
                          title="Edit Item"
                        >
                          <Edit className="icon-sm" />
                        </Button>
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
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="tenant-owner-inventory-action-btn delete"
                          onClick={() => handleDeleteItem(item)}
                          title="Delete Item"
                        >
                          <Trash2 className="icon-sm" />
                        </Button>
                      </div>
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
      </div>
      
      {/* QR Code Management Modal */}
      <QRCodeModal 
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
      />
    </div>
  );
}