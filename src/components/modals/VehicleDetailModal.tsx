"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Edit3, Car, Wrench, MapPin, DollarSign, Calendar, Package, QrCode, Trash2, Eye, EyeOff } from "lucide-react";
import QRCodeModal from "@/components/inventory/QRCodeModal";

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleUpdated?: () => void;
  onVehicleDeleted?: () => void;
  vehicle: any;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  onVehicleUpdated,
  onVehicleDeleted,
  vehicle
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    price: 0,
    status: "in_stock",
    location: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
    color: "",
    transmission: "",
    fuelType: "",
    mileage: "",
    condition: "",
    description: "",
    features: "",
    images: [] as string[]
  });

  // Initialize form data when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || "",
        sku: vehicle.sku || "",
        category: vehicle.category || "",
        quantity: vehicle.quantity || 0,
        price: vehicle.price || 0,
        status: vehicle.status || "in_stock",
        location: vehicle.location || "",
        year: vehicle.year || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        trim: vehicle.trim || "",
        vin: vehicle.vin || "",
        color: vehicle.color || "",
        transmission: vehicle.transmission || "",
        fuelType: vehicle.fuelType || "",
        mileage: vehicle.mileage || "",
        condition: vehicle.condition || "",
        description: vehicle.description || "",
        features: vehicle.features || "",
        images: vehicle.images || []
      });
    }
  }, [vehicle]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!vehicle?.id) {
      toast({
        title: "Error",
        description: "Vehicle ID not found",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to update vehicle
      // const response = await authenticatedFetch(`/api/inventory/${vehicle.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Mock successful save for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Vehicle Updated",
        description: `${formData.name} has been successfully updated.`,
      });

      setIsEditing(false);
      onVehicleUpdated?.();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicle?.id) return;

    setIsLoading(true);
    try {
      // TODO: Implement API call to delete vehicle
      // await authenticatedFetch(`/api/inventory/${vehicle.id}`, {
      //   method: 'DELETE'
      // });

      // Mock successful delete for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Vehicle Deleted",
        description: `${vehicle.name} has been removed from inventory.`,
      });

      setShowDeleteConfirm(false);
      onVehicleDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'in_stock': 'In Stock',
      'low_stock': 'Low Stock',
      'out_of_stock': 'Out of Stock'
    };
    return statusTexts[status] || status;
  };

  const getStatusBadgeStyles = (status: string) => {
    const styles = {
      'in_stock': { backgroundColor: '#dcfce7', color: '#166534' },
      'low_stock': { backgroundColor: '#fef3c7', color: '#92400e' },
      'out_of_stock': { backgroundColor: '#fecaca', color: '#991b1b' }
    };
    return styles[status] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  if (!vehicle) return null;

  const modalContent = (
    <>
      <Modal 
        open={isOpen} 
        onClose={onClose} 
        title={isEditing ? `Edit ${vehicle.name}` : vehicle.name}
        size="max"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto', padding: '16px' }}>
          {/* Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car style={{ height: '20px', width: '20px', color: '#2563eb' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>VIN: {vehicle.vin}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setShowQRModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <QrCode style={{ height: '16px', width: '16px' }} />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <Edit3 style={{ height: '16px', width: '16px' }} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#dc2626',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#f87171';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                  >
                    <Trash2 style={{ height: '16px', width: '16px' }} />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        name: vehicle.name || "",
                        sku: vehicle.sku || "",
                        category: vehicle.category || "",
                        quantity: vehicle.quantity || 0,
                        price: vehicle.price || 0,
                        status: vehicle.status || "in_stock",
                        location: vehicle.location || "",
                        year: vehicle.year || "",
                        make: vehicle.make || "",
                        model: vehicle.model || "",
                        trim: vehicle.trim || "",
                        vin: vehicle.vin || "",
                        color: vehicle.color || "",
                        transmission: vehicle.transmission || "",
                        fuelType: vehicle.fuelType || "",
                        mileage: vehicle.mileage || "",
                        condition: vehicle.condition || "",
                        description: vehicle.description || "",
                        features: vehicle.features || "",
                        images: vehicle.images || []
                      });
                    }}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? '0.5' : '1',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? '0.5' : '1',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }
                    }}
                  >
                    <Save style={{ height: '16px', width: '16px' }} />
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status and Pricing Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#2563eb', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Status</p>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      ...getStatusBadgeStyles(formData.status),
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      {getStatusText(formData.status)}
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px'
                }}>
                  <Car style={{ height: '24px', width: '24px', color: '#2563eb' }} />
                </div>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#16a34a', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Price</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#14532d', 
                    marginTop: '4px' 
                  }}>{formatCurrency(formData.price)}</p>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px'
                }}>
                  <DollarSign style={{ height: '24px', width: '24px', color: '#16a34a' }} />
                </div>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '1px solid #c084fc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#9333ea', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Quantity</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#581c87', 
                    marginTop: '4px' 
                  }}>{formData.quantity}</p>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px'
                }}>
                  <Package style={{ height: '24px', width: '24px', color: '#9333ea' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Basic Information */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827', 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <Package style={{ height: '20px', width: '20px', marginRight: '8px', color: '#2563eb' }} />
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.name}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  {isEditing ? (
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827', fontFamily: 'monospace' }}>{formData.sku}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  {isEditing ? (
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Coupe">Coupe</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Convertible">Convertible</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.category}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.location}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827', 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <Car style={{ height: '20px', width: '20px', marginRight: '8px', color: '#2563eb' }} />
                Vehicle Details
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    {isEditing ? (
                      <Input
                        id="year"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.year}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="make">Make</Label>
                    {isEditing ? (
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => handleInputChange('make', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.make}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    {isEditing ? (
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.model}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="trim">Trim</Label>
                    {isEditing ? (
                      <Input
                        id="trim"
                        value={formData.trim}
                        onChange={(e) => handleInputChange('trim', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.trim}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="vin">VIN</Label>
                  {isEditing ? (
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => handleInputChange('vin', e.target.value)}
                      disabled={isLoading}
                    />
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827', fontFamily: 'monospace' }}>{formData.vin}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827', 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <DollarSign style={{ height: '20px', width: '20px', marginRight: '8px', color: '#16a34a' }} />
              Inventory Management
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                {isEditing ? (
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                ) : (
                  <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formData.quantity}</div>
                )}
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                ) : (
                  <div style={{ marginTop: '4px', fontSize: '14px', color: '#111827' }}>{formatCurrency(formData.price)}</div>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      ...getStatusBadgeStyles(formData.status),
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {getStatusText(formData.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '16px'
            }}>Description</h3>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter vehicle description..."
                rows={3}
                disabled={isLoading}
              />
            ) : (
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {formData.description || "No description available."}
              </div>
            )}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Trash2 style={{ height: '20px', width: '20px', color: '#ef4444', marginRight: '8px' }} />
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>Confirm Deletion</h4>
              </div>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#b91c1c' }}>
                Are you sure you want to delete <strong>{vehicle.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? '0.5' : '1',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? '0.5' : '1',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                  }}
                >
                  <Trash2 style={{ height: '16px', width: '16px' }} />
                  <span>{isLoading ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        vehicle={vehicle}
      />
    </>
  );

  // Use createPortal to render outside the layout constraints
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default VehicleDetailModal;