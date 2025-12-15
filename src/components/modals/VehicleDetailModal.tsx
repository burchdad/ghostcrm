"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
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

  const getStatusBadge = (status: string) => {
    const badges = {
      'in_stock': { class: 'bg-green-100 text-green-800', text: 'In Stock' },
      'low_stock': { class: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' },
      'out_of_stock': { class: 'bg-red-100 text-red-800', text: 'Out of Stock' }
    };
    return badges[status] || { class: 'bg-gray-100 text-gray-800', text: status };
  };

  if (!vehicle) return null;

  return (
    <>
      <Modal 
        open={isOpen} 
        onClose={onClose} 
        title={isEditing ? `Edit ${vehicle.name}` : vehicle.name}
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">VIN: {vehicle.vin}</span>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQRModal(true)}
                    className="flex items-center space-x-1"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
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
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status and Pricing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Status</p>
                  <div className="mt-2">
                    <span className={`px-3 py-2 rounded-lg text-sm font-semibold ${getStatusBadge(formData.status).class} shadow-sm`}>
                      {getStatusBadge(formData.status).text}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Price</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(formData.price)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Quantity</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{formData.quantity}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="space-y-3">
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
                    <div className="mt-1 text-sm text-gray-900">{formData.name}</div>
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
                    <div className="mt-1 text-sm text-gray-900 font-mono">{formData.sku}</div>
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
                    <div className="mt-1 text-sm text-gray-900">{formData.category}</div>
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
                    <div className="mt-1 text-sm text-gray-900">{formData.location}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                Vehicle Details
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                      <div className="mt-1 text-sm text-gray-900">{formData.year}</div>
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
                      <div className="mt-1 text-sm text-gray-900">{formData.make}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      <div className="mt-1 text-sm text-gray-900">{formData.model}</div>
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
                      <div className="mt-1 text-sm text-gray-900">{formData.trim}</div>
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
                    <div className="mt-1 text-sm text-gray-900 font-mono">{formData.vin}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Inventory Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="mt-1 text-sm text-gray-900">{formData.quantity}</div>
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
                  <div className="mt-1 text-sm text-gray-900">{formatCurrency(formData.price)}</div>
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
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(formData.status).class}`}>
                      {getStatusBadge(formData.status).text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter vehicle description..."
                rows={3}
                disabled={isLoading}
              />
            ) : (
              <div className="text-sm text-gray-700">
                {formData.description || "No description available."}
              </div>
            )}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800">Confirm Deletion</h4>
              </div>
              <p className="mt-2 text-sm text-red-700">
                Are you sure you want to delete <strong>{vehicle.name}</strong>? This action cannot be undone.
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isLoading ? "Deleting..." : "Delete"}</span>
                </Button>
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
};

export default VehicleDetailModal;