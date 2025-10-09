"use client";
import React, { useState, useEffect } from "react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reserved: number;
  available: number;
  category: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  value: number;
}

const demoInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Premium License",
    quantity: 150,
    reserved: 25,
    available: 125,
    category: "Software",
    status: 'in-stock',
    value: 299
  },
  {
    id: "2", 
    name: "Consultation Hours",
    quantity: 80,
    reserved: 65,
    available: 15,
    category: "Services",
    status: 'low-stock',
    value: 150
  },
  {
    id: "3",
    name: "Training Credits",
    quantity: 0,
    reserved: 0,
    available: 0,
    category: "Education",
    status: 'out-of-stock',
    value: 75
  },
  {
    id: "4",
    name: "Support Tickets",
    quantity: 500,
    reserved: 120,
    available: 380,
    category: "Support",
    status: 'in-stock',
    value: 25
  }
];

export default function InventoryOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>(demoInventory);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate periodic inventory updates
    const interval = setInterval(() => {
      setConnectionStatus('syncing');
      
      // Simulate data refresh
      setTimeout(() => {
        setInventory(prev => prev.map(item => {
          const change = Math.floor(Math.random() * 10) - 5; // Random change -5 to +5
          const newQuantity = Math.max(0, item.quantity + change);
          const newAvailable = Math.max(0, newQuantity - item.reserved);
          
          let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
          if (newAvailable === 0) newStatus = 'out-of-stock';
          else if (newAvailable < 20) newStatus = 'low-stock';
          else newStatus = 'in-stock';
          
          return {
            ...item,
            quantity: newQuantity,
            available: newAvailable,
            status: newStatus
          };
        }));
        
        setConnectionStatus('online');
        setLastUpdate(new Date());
      }, 1500);
    }, 45000); // Update every 45 seconds

    // Simulate occasional connection issues
    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.03) { // 3% chance of connection issue
        setConnectionStatus('offline');
        setTimeout(() => {
          setConnectionStatus('online');
          setLastUpdate(new Date());
        }, 2000);
      }
    }, 20000); // Check every 20 seconds

    return () => {
      clearInterval(interval);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-700 bg-green-100 border-green-200';
      case 'low-stock': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'out-of-stock': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return '✅';
      case 'low-stock': return '⚠️';
      case 'out-of-stock': return '❌';
      default: return '📦';
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.available * item.value), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.available, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;

  return (
    <div className="bg-green-50 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-green-500 p-6 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-black">
            📦 Inventory Overview
          </h2>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-green-500' :
              connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className={`text-xs ${
              connectionStatus === 'online' ? 'text-green-600' :
              connectionStatus === 'syncing' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {connectionStatus === 'online' ? 'Live' :
               connectionStatus === 'syncing' ? 'Sync' :
               'Offline'}
            </span>
            <span className="text-xs text-gray-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalItems}</div>
          <div className="text-xs text-gray-600">Available Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Total Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
          <div className="text-xs text-gray-600">Low Stock</div>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStatusIcon(item.status)}</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between text-xs text-gray-600">
              <span>Available: <strong className="text-gray-900">{item.available}</strong></span>
              <span>Reserved: <strong className="text-gray-900">{item.reserved}</strong></span>
              <span>Value: <strong className="text-gray-900">${item.value}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}