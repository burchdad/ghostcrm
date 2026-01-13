"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/auth-context";
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
    images: [] as string[],
    videos: [] as string[]
  });

  // Media management state
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ photos: string[], videos: string[] }>({ photos: [], videos: [] });

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
        images: vehicle.images || [],
        videos: vehicle.videos || []
      });
      
      setMediaPreview({
        photos: vehicle.images || [],
        videos: vehicle.videos || []
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

  // Media upload handlers
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingMedia(true);
    try {
      // TODO: Implement Supabase storage upload
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setMediaPreview(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newPhotos] }));
      
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo(s) added successfully.`,
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingMedia(true);
    try {
      // TODO: Implement Supabase storage upload
      const newVideos = Array.from(files).map(file => URL.createObjectURL(file));
      setMediaPreview(prev => ({ ...prev, videos: [...prev.videos, ...newVideos] }));
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...newVideos] }));
      
      toast({
        title: "Videos Uploaded",
        description: `${files.length} video(s) added successfully.`,
      });
    } catch (error) {
      console.error("Error uploading videos:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index: number, type: 'photos' | 'videos') => {
    if (type === 'photos') {
      const newPhotos = mediaPreview.photos.filter((_, i) => i !== index);
      setMediaPreview(prev => ({ ...prev, photos: newPhotos }));
      setFormData(prev => ({ ...prev, images: newPhotos }));
    } else {
      const newVideos = mediaPreview.videos.filter((_, i) => i !== index);
      setMediaPreview(prev => ({ ...prev, videos: newVideos }));
      setFormData(prev => ({ ...prev, videos: newVideos }));
    }
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
                        images: vehicle.images || [],
                        videos: vehicle.videos || []
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
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1e293b', 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                <Package style={{ height: '24px', width: '24px', marginRight: '12px', color: '#3b82f6' }} />
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}>
                  <Label htmlFor="name" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Product Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isLoading}
                      style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                  ) : (
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '16px', 
                      color: '#1f2937', 
                      fontWeight: '500',
                      padding: '8px 0'
                    }}>{formData.name}</div>
                  )}
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}>
                  <Label htmlFor="sku" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>SKU</Label>
                  {isEditing ? (
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      disabled={isLoading}
                      style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                  ) : (
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '16px', 
                      color: '#1f2937', 
                      fontFamily: 'Monaco, Consolas, monospace',
                      backgroundColor: '#f9fafb',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>{formData.sku}</div>
                  )}
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}>
                  <Label htmlFor="category" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Category</Label>
                  {isEditing ? (
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}>
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
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '16px', 
                      color: '#1f2937', 
                      fontWeight: '500',
                      padding: '8px 0'
                    }}>{formData.category}</div>
                  )}
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}>
                  <Label htmlFor="location" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={isLoading}
                      style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                  ) : (
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '16px', 
                      color: '#1f2937', 
                      fontWeight: '500',
                      padding: '8px 0'
                    }}>{formData.location}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div style={{
              background: 'linear-gradient(135deg, #fef7e0 0%, #fed7aa 100%)',
              border: '1px solid #f59e0b',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.2)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#92400e', 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #f59e0b',
                paddingBottom: '12px'
              }}>
                <Car style={{ height: '24px', width: '24px', marginRight: '12px', color: '#d97706' }} />
                Vehicle Details
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #f59e0b',
                  boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>Basic Info</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <Label htmlFor="year" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Year</Label>
                      {isEditing ? (
                        <Input
                          id="year"
                          value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.year}</div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="make" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Make</Label>
                      {isEditing ? (
                        <Input
                          id="make"
                          value={formData.make}
                          onChange={(e) => handleInputChange('make', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.make}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #f59e0b',
                  boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>Model Info</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <Label htmlFor="model" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Model</Label>
                      {isEditing ? (
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => handleInputChange('model', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.model}</div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="trim" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Trim</Label>
                      {isEditing ? (
                        <Input
                          id="trim"
                          value={formData.trim}
                          onChange={(e) => handleInputChange('trim', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.trim}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #f59e0b',
                  boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)',
                  gridColumn: 'span 2'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>Vehicle Identification</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <Label htmlFor="vin" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>VIN</Label>
                      {isEditing ? (
                        <Input
                          id="vin"
                          value={formData.vin}
                          onChange={(e) => handleInputChange('vin', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#1f2937', 
                          fontFamily: 'Monaco, Consolas, monospace',
                          backgroundColor: '#f9fafb',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          letterSpacing: '1px'
                        }}>{formData.vin}</div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="color" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Color</Label>
                      {isEditing ? (
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.color || 'Not specified'}</div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="mileage" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>Mileage</Label>
                      {isEditing ? (
                        <Input
                          id="mileage"
                          value={formData.mileage}
                          onChange={(e) => handleInputChange('mileage', e.target.value)}
                          disabled={isLoading}
                          style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}
                          placeholder="e.g. 25,000 miles"
                        />
                      ) : (
                        <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500', padding: '8px 0' }}>{formData.mileage || 'Not specified'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
            border: '1px solid #3b82f6',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e40af', 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '12px'
            }}>
              <DollarSign style={{ height: '24px', width: '24px', marginRight: '12px', color: '#2563eb' }} />
              Inventory Management
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #3b82f6',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
              }}>
                <Label htmlFor="quantity" style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block', fontSize: '16px' }}>Quantity in Stock</Label>
                {isEditing ? (
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#1f2937',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #e5e7eb'
                  }}>{formData.quantity}</div>
                )}
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #3b82f6',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
              }}>
                <Label htmlFor="price" style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block', fontSize: '16px' }}>Price (USD)</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    style={{ borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#059669',
                    padding: '12px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #a7f3d0'
                  }}>{formatCurrency(formData.price)}</div>
                )}
              </div>
              
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #3b82f6',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
              }}>
                <Label htmlFor="status" style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block', fontSize: '16px' }}>Stock Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger style={{ borderRadius: '8px', border: '1px solid #d1d5db' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div style={{ marginTop: '4px', textAlign: 'center' }}>
                    <span style={{
                      ...getStatusBadgeStyles(formData.status),
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {getStatusText(formData.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #22c55e',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(34, 197, 94, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#15803d',
              marginBottom: '20px',
              borderBottom: '2px solid #22c55e',
              paddingBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              📝 Description & Notes
            </h3>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter detailed vehicle description, features, condition notes, and any other relevant information..."
                rows={4}
                disabled={isLoading}
                style={{
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  padding: '16px',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            ) : (
              <div style={{ 
                fontSize: '16px', 
                color: '#374151',
                lineHeight: '1.6',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                minHeight: '60px',
                whiteSpace: 'pre-wrap'
              }}>
                {formData.description || (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No description available. Add detailed information about this vehicle's features, condition, and specifications.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Vehicle Photos */}
          <div style={{
            background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
            border: '1px solid #a855f7',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(168, 85, 247, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #a855f7',
              paddingBottom: '12px'
            }}>
              <Package style={{ height: '24px', width: '24px', marginRight: '12px', color: '#8b5cf6' }} />
              Vehicle Photos
            </h3>
            
            {isEditing && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '2px dashed #a855f7',
                  borderRadius: '12px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#7c3aed',
                  fontWeight: '600'
                }}>
                  <span>📸 Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    style={{ display: 'none' }}
                    disabled={uploadingMedia}
                  />
                </label>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {mediaPreview.photos.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  gridColumn: '1 / -1'
                }}>
                  📷 No photos uploaded yet
                </div>
              ) : (
                mediaPreview.photos.map((photo, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <img 
                      src={photo} 
                      alt={`Vehicle photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover'
                      }}
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeMedia(index, 'photos')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vehicle Videos */}
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #ef4444',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#dc2626', 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #ef4444',
              paddingBottom: '12px'
            }}>
              <Package style={{ height: '24px', width: '24px', marginRight: '12px', color: '#f87171' }} />
              Vehicle Videos
            </h3>
            
            {isEditing && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '2px dashed #ef4444',
                  borderRadius: '12px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#dc2626',
                  fontWeight: '600'
                }}>
                  <span>🎥 Upload Videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e.target.files)}
                    style={{ display: 'none' }}
                    disabled={uploadingMedia}
                  />
                </label>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {mediaPreview.videos.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  gridColumn: '1 / -1'
                }}>
                  🎬 No videos uploaded yet
                </div>
              ) : (
                mediaPreview.videos.map((video, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <video 
                      src={video}
                      controls
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeMedia(index, 'videos')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
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