"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import "./page.css";

interface InventoryFormData {
  make: string;
  model: string;
  year: string;
  trim: string;
  vin: string;
  stockNumber: string;
  price: string;
  costPrice: string;
  condition: string;
  mileage: string;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  fuelType: string;
  engine: string;
  drivetrain: string;
  bodyType: string;
  features: string[];
  description: string;
  images: File[];
  location: string;
  status: string;
  certification: string;
  warranty: string;
  tags: string[];
}

export default function TenantNewInventoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkImportMode, setBulkImportMode] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [vinLookupLoading, setVinLookupLoading] = useState(false);
  const [formData, setFormData] = useState<InventoryFormData>({
    make: "",
    model: "",
    year: "",
    trim: "",
    vin: "",
    stockNumber: "",
    price: "",
    costPrice: "",
    condition: "Used",
    mileage: "",
    exteriorColor: "",
    interiorColor: "",
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "",
    drivetrain: "FWD",
    bodyType: "Sedan",
    features: [],
    description: "",
    images: [],
    location: "Main Lot",
    status: "Available",
    certification: "",
    warranty: "",
    tags: []
  });

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_NEW_INVENTORY] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  const conditions = ["New", "Used", "Certified Pre-Owned", "Refurbished"];
  const transmissions = ["Automatic", "Manual", "CVT", "Semi-Automatic"];
  const fuelTypes = ["Gasoline", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid"];
  const drivetrains = ["FWD", "RWD", "AWD", "4WD"];
  const bodyTypes = ["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Convertible", "Wagon", "Minivan"];
  const locations = ["Main Lot", "Service Bay", "Detail Shop", "Off-Site", "Sold", "Reserved"];
  const statuses = ["Available", "Pending", "Sold", "In Transit", "Service Required", "Reserved"];
  const certifications = ["None", "Manufacturer Certified", "Third Party Certified", "Dealership Certified"];
  const commonFeatures = ["Navigation", "Bluetooth", "Backup Camera", "Sunroof", "Leather Seats", "Heated Seats", 
                         "Apple CarPlay", "Android Auto", "Remote Start", "Keyless Entry", "Premium Audio", "Lane Assist"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field: keyof Pick<InventoryFormData, 'features' | 'tags'>, item: string) => {
    if (item && !formData[field].includes(item)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
    }
  };

  const handleArrayRemove = (field: keyof Pick<InventoryFormData, 'features' | 'tags'>, itemToRemove: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(item => item !== itemToRemove) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleVinLookup = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN.",
        variant: "destructive",
      });
      return;
    }

    setVinLookupLoading(true);
    try {
      // TODO: Implement VIN lookup API integration
      // This would typically call a service like NHTSA, Edmunds, or CarMD
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock data population
      setFormData(prev => ({
        ...prev,
        make: "Honda",
        model: "Civic",
        year: "2022",
        trim: "LX",
        engine: "2.0L 4-Cylinder"
      }));

      toast({
        title: "VIN Lookup Complete",
        description: "Vehicle information has been populated automatically.",
      });
    } catch (error) {
      toast({
        title: "VIN Lookup Failed",
        description: "Could not retrieve vehicle information. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setVinLookupLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'inventory');

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import Successful",
          description: `Imported ${result.count} vehicles successfully!`,
        });
        router.push("/tenant-owner/inventory");
      } else {
        throw new Error('Import failed');
      }
    } catch (error: any) {
      console.error("Error importing inventory:", error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to import inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create inventory via API
      const inventoryData = new FormData();
      
      // Add vehicle data
      inventoryData.append('make', formData.make);
      inventoryData.append('model', formData.model);
      inventoryData.append('year', formData.year);
      inventoryData.append('trim', formData.trim);
      inventoryData.append('vin', formData.vin);
      inventoryData.append('stock_number', formData.stockNumber);
      inventoryData.append('price', formData.price);
      inventoryData.append('cost_price', formData.costPrice);
      inventoryData.append('condition', formData.condition);
      inventoryData.append('mileage', formData.mileage);
      inventoryData.append('exterior_color', formData.exteriorColor);
      inventoryData.append('interior_color', formData.interiorColor);
      inventoryData.append('transmission', formData.transmission);
      inventoryData.append('fuel_type', formData.fuelType);
      inventoryData.append('engine', formData.engine);
      inventoryData.append('drivetrain', formData.drivetrain);
      inventoryData.append('body_type', formData.bodyType);
      inventoryData.append('features', JSON.stringify(formData.features));
      inventoryData.append('description', formData.description);
      inventoryData.append('location', formData.location);
      inventoryData.append('status', formData.status);
      inventoryData.append('certification', formData.certification);
      inventoryData.append('warranty', formData.warranty);
      inventoryData.append('tags', JSON.stringify(formData.tags));

      // Add images
      formData.images.forEach((image, index) => {
        inventoryData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/inventory', {
        method: 'POST',
        body: inventoryData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Vehicle added to inventory successfully!",
        });
        router.push("/tenant-owner/inventory");
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create inventory');
      }
    } catch (error: any) {
      console.error("Error creating inventory:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const generateStockNumber = () => {
    const year = new Date().getFullYear().toString().substr(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setFormData(prev => ({ ...prev, stockNumber: `${year}${random}` }));
  };

  return (
    <div className="tenant-new-inventory-page">
      <div className="new-inventory-form-container">
        {/* Header */}
        <div className="inventory-page-header">
          <div className="inventory-page-title">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">🚗</span>
                Add New Vehicle
              </h1>
              <p className="inventory-page-subtitle">Add a new vehicle to your inventory</p>
            </div>
          </div>
          <div className="inventory-header-actions">
            <button
              onClick={() => setBulkImportMode(!bulkImportMode)}
              className="inventory-btn inventory-btn-secondary"
            >
              <span>📊</span>
              {bulkImportMode ? 'Single Entry' : 'Bulk Import'}
            </button>
            <button
              onClick={handleCancel}
              className="inventory-btn inventory-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={bulkImportMode ? handleBulkImport : handleSubmit}
              disabled={isSubmitting}
              className="inventory-btn inventory-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="inventory-spinner"></div>
                  {bulkImportMode ? 'Importing...' : 'Creating...'}
                </>
              ) : (
                <>
                  <span>{bulkImportMode ? '📥' : '💾'}</span>
                  {bulkImportMode ? 'Import Vehicles' : 'Add Vehicle'}
                </>
              )}
            </button>
          </div>
        </div>

        {bulkImportMode ? (
          /* Bulk Import Section */
          <div className="inventory-form-section">
            <h2 className="inventory-section-header">
              <span>📊</span>
              Bulk Import Inventory
            </h2>
            <div className="bulk-import-container">
              <div className="import-instructions">
                <h3>Import Instructions:</h3>
                <ul>
                  <li>• Upload CSV or Excel files with vehicle data</li>
                  <li>• Required columns: make, model, year, vin, price</li>
                  <li>• Optional columns: trim, mileage, color, transmission, features</li>
                  <li>• Images can be uploaded separately after import</li>
                  <li>• Maximum 500 vehicles per import</li>
                </ul>
              </div>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="inventory-file-upload"
                />
                <label htmlFor="inventory-file-upload" className="file-upload-label">
                  <span>📁</span>
                  {importFile ? importFile.name : 'Choose inventory file to upload'}
                </label>
              </div>
              <div className="integration-options">
                <h3>Available Integrations:</h3>
                <div className="integration-buttons">
                  <button className="integration-btn" disabled>
                    <span>🏢</span>
                    ManageMarketplace
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>🚗</span>
                    AutoTrader
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>💼</span>
                    Cars.com
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>📱</span>
                    CarGurus
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>🔍</span>
                    VIN Scanner
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>📷</span>
                    Photo Importer
                    <small>Coming Soon</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single Vehicle Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vehicle Identification */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>🔍</span>
                Vehicle Identification
              </h2>
              <div className="inventory-form-grid">
                <div className="full-width">
                  <label className="inventory-form-label">
                    VIN (Vehicle Identification Number) *
                  </label>
                  <div className="vin-input-container">
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      required
                      maxLength={17}
                      className="inventory-form-input vin-input"
                      placeholder="1HGCV1F3XNA123456"
                    />
                    <button
                      type="button"
                      onClick={handleVinLookup}
                      disabled={vinLookupLoading || formData.vin.length !== 17}
                      className="vin-lookup-btn"
                    >
                      {vinLookupLoading ? (
                        <div className="inventory-spinner small"></div>
                      ) : (
                        '🔍'
                      )}
                      Lookup
                    </button>
                  </div>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Stock Number
                  </label>
                  <div className="stock-input-container">
                    <input
                      type="text"
                      name="stockNumber"
                      value={formData.stockNumber}
                      onChange={handleInputChange}
                      className="inventory-form-input"
                      placeholder="ST2024001"
                    />
                    <button
                      type="button"
                      onClick={generateStockNumber}
                      className="generate-stock-btn"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>📋</span>
                Vehicle Details
              </h2>
              <div className="inventory-form-grid grid-3">
                <div>
                  <label className="inventory-form-label">
                    Make *
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                    className="inventory-form-input"
                    placeholder="Honda"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="inventory-form-input"
                    placeholder="Civic"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 2}
                    className="inventory-form-input"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Trim Level
                  </label>
                  <input
                    type="text"
                    name="trim"
                    value={formData.trim}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="LX"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="inventory-form-input"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Mileage
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="45000"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>💰</span>
                Pricing Information
              </h2>
              <div className="inventory-form-grid">
                <div>
                  <label className="inventory-form-label">
                    Selling Price *
                  </label>
                  <div className="inventory-financial-input">
                    <span className="inventory-currency-symbol">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="inventory-form-input"
                      placeholder="25000"
                    />
                  </div>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Cost Price
                  </label>
                  <div className="inventory-financial-input">
                    <span className="inventory-currency-symbol">$</span>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className="inventory-form-input"
                      placeholder="20000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>⚙️</span>
                Vehicle Specifications
              </h2>
              <div className="inventory-form-grid grid-3">
                <div>
                  <label className="inventory-form-label">
                    Exterior Color
                  </label>
                  <input
                    type="text"
                    name="exteriorColor"
                    value={formData.exteriorColor}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="Red"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Interior Color
                  </label>
                  <input
                    type="text"
                    name="interiorColor"
                    value={formData.interiorColor}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="Black"
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Body Type
                  </label>
                  <select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {transmissions.map(trans => (
                      <option key={trans} value={trans}>{trans}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {fuelTypes.map(fuel => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Drivetrain
                  </label>
                  <select
                    name="drivetrain"
                    value={formData.drivetrain}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {drivetrains.map(drive => (
                      <option key={drive} value={drive}>{drive}</option>
                    ))}
                  </select>
                </div>
                <div className="full-width">
                  <label className="inventory-form-label">
                    Engine
                  </label>
                  <input
                    type="text"
                    name="engine"
                    value={formData.engine}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="2.0L 4-Cylinder"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>✨</span>
                Features & Options
              </h2>
              <div>
                <label className="inventory-form-label">
                  Vehicle Features
                </label>
                <div className="inventory-array-container">
                  <div className="inventory-array-tags">
                    {formData.features.map((feature, index) => (
                      <span key={index} className="inventory-array-tag features">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleArrayRemove('features', feature)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="inventory-array-input-row">
                    <input
                      type="text"
                      placeholder="Add a feature and press Enter"
                      className="inventory-array-input inventory-form-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          handleArrayAdd('features', target.value.trim());
                          target.value = "";
                        }
                      }}
                    />
                    {commonFeatures.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => handleArrayAdd('features', feature)}
                        className="inventory-quick-add-btn"
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>📷</span>
                Vehicle Images
              </h2>
              <div>
                <label className="inventory-form-label">
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="inventory-form-input"
                />
                {formData.images.length > 0 && (
                  <div className="image-preview">
                    <p>{formData.images.length} image(s) selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Location */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>📍</span>
                Status & Location
              </h2>
              <div className="inventory-form-grid grid-3">
                <div>
                  <label className="inventory-form-label">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inventory-form-label">
                    Certification
                  </label>
                  <select
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                  >
                    {certifications.map(cert => (
                      <option key={cert} value={cert}>{cert}</option>
                    ))}
                  </select>
                </div>
                <div className="full-width">
                  <label className="inventory-form-label">
                    Warranty Information
                  </label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    className="inventory-form-input"
                    placeholder="3 years/36,000 miles bumper-to-bumper"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="inventory-form-section">
              <h2 className="inventory-section-header">
                <span>📝</span>
                Additional Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="inventory-form-label">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="inventory-form-input"
                    placeholder="Detailed description of the vehicle, its condition, special features, service history..."
                  />
                </div>
                <div>
                  <label className="inventory-form-label">
                    Tags
                  </label>
                  <div className="inventory-array-container">
                    <div className="inventory-array-tags">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="inventory-array-tag tags">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('tags', tag)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="inventory-array-input-row">
                      <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        className="inventory-array-input inventory-form-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            handleArrayAdd('tags', target.value.trim());
                            target.value = "";
                          }
                        }}
                      />
                      {["Hot Deal", "Low Mileage", "One Owner", "Accident Free", "Service Records", "Clean Title"].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleArrayAdd('tags', tag)}
                          className="inventory-quick-add-btn"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="inventory-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="inventory-btn inventory-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inventory-btn inventory-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="inventory-spinner"></div>
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Add to Inventory
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}