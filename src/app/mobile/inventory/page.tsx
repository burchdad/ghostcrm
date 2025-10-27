'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  vin: string;
  status: 'available' | 'sold' | 'pending' | 'service';
  location: string;
  images: string[];
  qrCode?: string;
}

export default function MobileInventory() {
  const { user, organization } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'sold'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, [filter, searchTerm]);

  const loadInventory = async () => {
    try {
      // Simulate API call
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          make: 'Honda',
          model: 'Civic',
          year: 2024,
          price: 28500,
          mileage: 12000,
          color: 'Silver',
          vin: '1HGBH41JXMN109186',
          status: 'available',
          location: 'Lot A-1',
          images: ['/api/placeholder/300/200'],
          qrCode: 'QR001'
        },
        {
          id: '2',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 32000,
          mileage: 8500,
          color: 'Blue',
          vin: '4T1BF1FK5EU123456',
          status: 'pending',
          location: 'Lot B-3',
          images: ['/api/placeholder/300/200'],
          qrCode: 'QR002'
        },
        {
          id: '3',
          make: 'Ford',
          model: 'F-150',
          year: 2024,
          price: 45000,
          mileage: 5200,
          color: 'Red',
          vin: '1FTFW1ET5DFC12345',
          status: 'available',
          location: 'Lot C-5',
          images: ['/api/placeholder/300/200'],
          qrCode: 'QR003'
        }
      ];

      let filteredVehicles = mockVehicles;

      // Apply status filter
      if (filter !== 'all') {
        filteredVehicles = filteredVehicles.filter(v => v.status === filter);
      }

      // Apply search filter
      if (searchTerm) {
        filteredVehicles = filteredVehicles.filter(v =>
          `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.vin.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setVehicles(filteredVehicles);
      setLoading(false);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const handleGenerateQR = (vehicleId: string) => {
    // Navigate to QR code generation
    console.log('Generate QR for vehicle:', vehicleId);
  };

  const handleViewDetails = (vehicleId: string) => {
    // Navigate to vehicle details
    console.log('View details for vehicle:', vehicleId);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Vehicle
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by make, model, year, or VIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All', count: vehicles.length },
          { key: 'available', label: 'Available', count: vehicles.filter(v => v.status === 'available').length },
          { key: 'pending', label: 'Pending', count: vehicles.filter(v => v.status === 'pending').length },
          { key: 'sold', label: 'Sold', count: vehicles.filter(v => v.status === 'sold').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Vehicle Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={vehicle.images[0] || '/api/placeholder/300/200'}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/300/200';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.toUpperCase()}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleGenerateQR(vehicle.id)}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(vehicle.price)}
                  </p>
                </div>
                <button
                  onClick={() => handleViewDetails(vehicle.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{formatMileage(vehicle.mileage)} miles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                  </svg>
                  <span>{vehicle.color}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{vehicle.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs">{vehicle.vin}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">
                  View Details
                </button>
                <button
                  onClick={() => handleGenerateQR(vehicle.id)}
                  className="bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  QR Code
                </button>
                {vehicle.status === 'available' && (
                  <button className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700">
                    Sell
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Add vehicles to your inventory'}
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            Add First Vehicle
          </button>
        </div>
      )}
    </div>
  );
}