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
          { id: 1, name: "2024 Honda Civic", sku: "HC2024001", category: "Sedan", quantity: 5, price: 28500, status: "in_stock", location: "Lot A" },
          { id: 2, name: "2024 Toyota Camry", sku: "TC2024001", category: "Sedan", quantity: 8, price: 32000, status: "in_stock", location: "Lot A" },
          { id: 3, name: "2024 Ford F-150", sku: "FF2024001", category: "Truck", quantity: 3, price: 45000, status: "low_stock", location: "Lot B" },
          { id: 4, name: "2024 Chevrolet Equinox", sku: "CE2024001", category: "SUV", quantity: 0, price: 35000, status: "out_of_stock", location: "Lot C" },
          { id: 5, name: "2024 BMW X3", sku: "BX2024001", category: "SUV", quantity: 12, price: 55000, status: "in_stock", location: "Premium Lot" }
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
    // Navigate to detailed view
    router.push(`/tenant-owner/inventory/${item.id || item.sku}`);
  };

  const handleEditItem = (item: any) => {
    // Navigate to edit page
    router.push(`/tenant-owner/inventory/edit/${item.id || item.sku}`);
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
    // Open QR code configuration modal
    setSelectedVehicle(item);
    setQrModalOpen(true);
    
    toast({
      title: "QR Code Manager",
      description: "Configure QR code features and settings.",
    });
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
    <div className="tenant-owner-inventory-container">
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              📦 {organizationName} - Inventory Management
            </h1>
            <p className="page-subtitle">Owner Dashboard - Full Access</p>
          </div>
          <div className="header-actions">
            <Button className="btn-primary">
              <Plus className="icon" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-grid">
        <Card className="analytics-card inventory">
          <div className="card-content">
            <div className="metric-info">
              <h3>Total Items</h3>
              <p className="metric-value">{analytics.totalItems}</p>
              <p className="metric-change neutral">{inventory.length} unique products</p>
            </div>
            <div className="metric-icon">
              <Package />
            </div>
          </div>
        </Card>

        <Card className="analytics-card value">
          <div className="card-content">
            <div className="metric-info">
              <h3>Inventory Value</h3>
              <p className="metric-value">{formatCurrency(analytics.totalValue)}</p>
              <p className="metric-change positive">Total asset value</p>
            </div>
            <div className="metric-icon">
              <TrendingUp />
            </div>
          </div>
        </Card>

        <Card className="analytics-card warning">
          <div className="card-content">
            <div className="metric-info">
              <h3>Low Stock</h3>
              <p className="metric-value">{analytics.lowStock}</p>
              <p className="metric-change warning">Needs attention</p>
            </div>
            <div className="metric-icon">
              <AlertTriangle />
            </div>
          </div>
        </Card>

        <Card className="analytics-card critical">
          <div className="card-content">
            <div className="metric-info">
              <h3>Out of Stock</h3>
              <p className="metric-value">{analytics.outOfStock}</p>
              <p className="metric-change critical">Immediate action needed</p>
            </div>
            <div className="metric-icon">
              <AlertTriangle />
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            placeholder="Search inventory by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="control-actions">
          <Button
            variant={bulkMode ? "default" : "outline"}
            onClick={() => setBulkMode(!bulkMode)}
            className="bulk-mode-btn"
          >
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="inventory-table-card">
        {filteredInventory.length === 0 ? (
          <EmptyStateComponent
            type="general"
            title="No inventory items found"
            description="Get started by adding your first inventory item or adjust your search filters."
            actionLabel="Add Item"
            onAction={() => {
              toast({
                title: "New Inventory Item",
                description: "Item creation modal would open here",
              });
            }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {bulkMode && <TableHead className="w-12">Select</TableHead>}
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
                  <TableRow key={item.id || index} className="inventory-row">
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
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="action-btn view"
                          onClick={() => handleViewItem(item)}
                          title="View Details"
                        >
                          <Eye className="icon-sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="action-btn edit"
                          onClick={() => handleEditItem(item)}
                          title="Edit Item"
                        >
                          <Edit className="icon-sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="action-btn qr-code"
                          onClick={() => handlePrintQRCode(item)}
                          title="Print QR Code (Patent Pending)"
                        >
                          <QrCode className="icon-sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="action-btn delete"
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