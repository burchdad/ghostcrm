"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Car,
  Eye,
  Heart,
  DollarSign,
  Gauge,
  Fuel,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Star
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  mileage: number;
  price: number;
  msrp: number;
  status: 'available' | 'sold' | 'pending' | 'reserved';
  color: string;
  interiorColor: string;
  engine: string;
  features: string[];
  images: string[];
  location: string;
  dateAdded: string;
  interests: Array<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    dateOfInterest: string;
    notes: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  assignedTo?: string;
  testDriveScheduled?: boolean;
}

export default function TenantSalesRepInventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_REP_INVENTORY] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  useRibbonPage({
    context: "inventory",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showInterestsOnly, setShowInterestsOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has proper access
  if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, makeFilter, statusFilter, priceRange, showInterestsOnly]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      
      // Fetch real inventory data for sales rep
      const response = await fetch('/api/inventory/salesrep', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data || []);
        console.log('✅ [INVENTORY SALES REP] Successfully fetched vehicle data');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [INVENTORY SALES REP] Failed to fetch data:', error);
      setVehicles([]);
      toast({
        title: "Error Loading Inventory",
        description: "Unable to load vehicle inventory data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm) ||
        vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (makeFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.make.toLowerCase() === makeFilter.toLowerCase());
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    if (priceRange.min) {
      filtered = filtered.filter(vehicle => vehicle.price >= parseInt(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter(vehicle => vehicle.price <= parseInt(priceRange.max));
    }

    if (showInterestsOnly) {
      filtered = filtered.filter(vehicle => vehicle.interests.length > 0);
    }

    setFilteredVehicles(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'sold': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'reserved': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.available;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || colors.low;
  };

  const handleContactCustomer = (email: string, phone: string, type: 'call' | 'email') => {
    if (type === 'call') {
      window.location.href = `tel:${phone}`;
    } else {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleScheduleTestDrive = (vehicleId: string) => {
    toast({
      title: "Test Drive",
      description: "Test drive scheduling would open here",
    });
    // Navigation to test drive scheduling would be implemented here
  };

  const uniqueMakes = [...new Set(vehicles.map(v => v.make))];

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Browse available vehicles and track customer interests</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showInterestsOnly ? "default" : "outline"}
            onClick={() => setShowInterestsOnly(!showInterestsOnly)}
          >
            <Heart className="w-4 h-4 mr-2" />
            Show Interests Only
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.round(vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customer Interests</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.reduce((sum, v) => sum + v.interests.length, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Assignments</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.assignedTo === (user ? user.email.split('@')[0] : 'Sales Rep')).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
          >
            <option value="all">All Makes</option>
            {uniqueMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="pending">Pending</option>
            <option value="reserved">Reserved</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
          />
        </div>
      </Card>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            {/* Vehicle Image */}
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
              </div>
              {vehicle.interests.length > 0 && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white rounded-full p-1">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-medium">{vehicle.location}</p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${vehicle.price.toLocaleString()}</p>
                  {vehicle.price < vehicle.msrp && (
                    <p className="text-sm text-gray-500 line-through">${vehicle.msrp.toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{vehicle.trim} • {vehicle.color}</p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Gauge className="w-4 h-4 mr-1" />
                  {vehicle.mileage.toLocaleString()} mi
                </div>
                <div className="flex items-center">
                  <Fuel className="w-4 h-4 mr-1" />
                  {vehicle.fuelType}
                </div>
              </div>

              {/* Customer Interests */}
              {vehicle.interests.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Customer Interests ({vehicle.interests.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {vehicle.interests.map((interest, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{interest.customerName}</p>
                            <p className="text-gray-600 text-xs">{interest.notes}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${getPriorityColor(interest.priority)}`} />
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContactCustomer(interest.customerEmail, interest.customerPhone, 'call')}
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContactCustomer(interest.customerEmail, interest.customerPhone, 'email')}
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/tenant-salesrep/inventory/${vehicle.id}`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                {vehicle.interests.length > 0 && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleScheduleTestDrive(vehicle.id)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                )}
              </div>

              {vehicle.assignedTo === (user ? user.email.split('@')[0] : 'Sales Rep') && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Assigned to you
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}