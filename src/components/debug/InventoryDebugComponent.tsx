/**
 * Inventory API Debug Component
 * Interactive testing interface for inventory APIs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Upload, Download, Search, Plus, Edit, Trash2 } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  price_selling: number;
  stock_on_hand: number;
  status: string;
  created_at: string;
}

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export default function InventoryDebugComponent() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    price_cost: '',
    price_selling: '',
    stock_on_hand: '',
    description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // API helper function
  const apiRequest = async (endpoint: string, method = 'GET', data: any = null) => {
    const url = `/api/${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}`);
      }
      
      return responseData;
    } catch (err) {
      console.error(`API Error (${method} ${url}):`, err);
      throw err;
    }
  };

  // Load inventory data
  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = 'inventory';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await apiRequest(endpoint);
      setInventory(response.data || []);
      setSuccess(`Loaded ${response.data?.length || 0} inventory items`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Create new inventory item
  const createItem = async () => {
    if (!newItem.name || !newItem.sku || !newItem.category) {
      setError('Name, SKU, and Category are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const itemData = {
        ...newItem,
        price_cost: parseFloat(newItem.price_cost) || 0,
        price_selling: parseFloat(newItem.price_selling) || 0,
        stock_on_hand: parseInt(newItem.stock_on_hand) || 0,
      };
      
      await apiRequest('inventory', 'POST', itemData);
      setSuccess(`Created inventory item: ${newItem.name}`);
      
      // Reset form
      setNewItem({
        name: '',
        sku: '',
        category: '',
        brand: '',
        price_cost: '',
        price_selling: '',
        stock_on_hand: '',
        description: ''
      });
      
      // Reload inventory
      await loadInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item
  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest(`inventory?id=${id}`, 'DELETE');
      setSuccess('Item deleted successfully');
      await loadInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  // Test bulk import
  const testBulkImport = async () => {
    const testData = [
      {
        "Product Name": "AI Test Item 1", // Different column name to test AI mapping
        "Item Code": `AI-BULK-${Date.now()}-1`, // Different column name
        "Product Type": "Test Category",
        "Manufacturer": "Test Brand",
        "Cost Price": 50,
        "Selling Price": 75,
        "Qty": 5,
        "Warehouse Location": "Main Warehouse"
      },
      {
        "Product Name": "AI Test Item 2",
        "Item Code": `AI-BULK-${Date.now()}-2`,
        "Product Type": "Test Category", 
        "Manufacturer": "Test Brand",
        "Cost Price": "$60.00", // Test currency parsing
        "Selling Price": "$85.00",
        "Qty": "3 units", // Test intelligent parsing
        "Condition": "Brand New" // Test condition mapping
      }
    ];
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('inventory/bulk', 'POST', { items: testData });
      
      let message = `AI-powered bulk import successful: ${response.results?.successful || 0} items imported`;
      
      // Show AI mapping information
      if (response.results?.aiMapping) {
        const { confidence, detectedFields, suggestions } = response.results.aiMapping;
        message += `\n\n🧠 AI Field Mapping (${(confidence * 100).toFixed(1)}% confidence):`;
        
        Object.entries(detectedFields).forEach(([target, detected]) => {
          message += `\n• "${detected}" → ${target}`;
        });
        
        if (suggestions.length > 0) {
          message += `\n\n💡 AI Suggestions:\n${suggestions.join('\n')}`;
        }
      }
      
      setSuccess(message);
      await loadInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI bulk import failed');
    } finally {
      setLoading(false);
    }
  };

  // Test export
  const testExport = async (format: 'json' | 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/inventory/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `inventory_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`${format.toUpperCase()} export downloaded successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  // Run comprehensive API tests
  const runAPITests = async () => {
    setLoading(true);
    setError(null);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    const logTest = (test: string, passed: boolean, details = '') => {
      const result = {
        test,
        passed,
        details,
        timestamp: new Date().toISOString()
      };
      results.push(result);
      setTestResults([...results]);
      return result;
    };

    try {
      // Test 1: GET inventory
      try {
        await apiRequest('inventory');
        logTest('GET /api/inventory', true, 'Successfully retrieved inventory');
      } catch (err) {
        logTest('GET /api/inventory', false, err instanceof Error ? err.message : 'Unknown error');
      }

      // Test 2: Create item
      const testItem = {
        name: `Test Item ${Date.now()}`,
        sku: `TEST-${Date.now()}`,
        category: 'Test Category',
        brand: 'Test Brand',
        price_selling: 100,
        stock_on_hand: 5
      };

      let createdId: string | null = null;
      try {
        const response = await apiRequest('inventory', 'POST', testItem);
        createdId = response.data?.id;
        logTest('POST /api/inventory', true, `Created item with ID: ${createdId}`);
      } catch (err) {
        logTest('POST /api/inventory', false, err instanceof Error ? err.message : 'Unknown error');
      }

      // Test 3: Duplicate SKU (should fail)
      try {
        await apiRequest('inventory', 'POST', testItem);
        logTest('Duplicate SKU handling', false, 'Should have rejected duplicate SKU');
      } catch (err) {
        logTest('Duplicate SKU handling', true, 'Correctly rejected duplicate SKU');
      }

      // Test 4: Bulk import
      try {
        const bulkData = {
          items: [
            {
              name: "Bulk Test Item",
              sku: `BULK-TEST-${Date.now()}`,
              category: "Test Category",
              price_selling: 50,
              stock_on_hand: 2
            }
          ]
        };
        await apiRequest('inventory/bulk', 'POST', bulkData);
        logTest('POST /api/inventory/bulk', true, 'Bulk import successful');
      } catch (err) {
        logTest('POST /api/inventory/bulk', false, err instanceof Error ? err.message : 'Unknown error');
      }

      // Test 5: Export
      try {
        const response = await fetch('/api/inventory/export?format=json');
        if (response.ok) {
          logTest('GET /api/inventory/export', true, 'JSON export successful');
        } else {
          logTest('GET /api/inventory/export', false, `HTTP ${response.status}`);
        }
      } catch (err) {
        logTest('GET /api/inventory/export', false, err instanceof Error ? err.message : 'Unknown error');
      }

      // Test 6: Clean up test items
      if (createdId) {
        try {
          await apiRequest(`inventory?id=${createdId}`, 'DELETE');
          logTest('DELETE /api/inventory', true, 'Successfully deleted test item');
        } catch (err) {
          logTest('DELETE /api/inventory', false, err instanceof Error ? err.message : 'Unknown error');
        }
      }

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      setSuccess(`API Tests completed: ${passed}/${total} passed (${((passed/total)*100).toFixed(1)}%)`);

      // Reload inventory after tests
      await loadInventory();
      
    } catch (err) {
      setError('Test execution failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory API Debug Console</h1>
        <p className="text-gray-600 mt-2">Test and validate inventory system functionality</p>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="create">Create Item</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="tests">API Tests</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, SKU, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Test Category">Test Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={loadInventory} disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory List */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items ({inventory.length})</CardTitle>
              <CardDescription>Current inventory in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading inventory...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No inventory items found. Create some items to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline">{item.sku}</Badge>
                          <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Category:</strong> {item.category}</p>
                          {item.brand && <p><strong>Brand:</strong> {item.brand}</p>}
                          <p><strong>Price:</strong> ${item.price_selling?.toFixed(2) || '0.00'}</p>
                          <p><strong>Stock:</strong> {item.stock_on_hand} units</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Item Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="Unique SKU"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Test Category">Test Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="price_cost">Cost Price</Label>
                  <Input
                    id="price_cost"
                    type="number"
                    step="0.01"
                    value={newItem.price_cost}
                    onChange={(e) => setNewItem({ ...newItem, price_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="price_selling">Selling Price</Label>
                  <Input
                    id="price_selling"
                    type="number"
                    step="0.01"
                    value={newItem.price_selling}
                    onChange={(e) => setNewItem({ ...newItem, price_selling: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_on_hand">Stock Quantity</Label>
                  <Input
                    id="stock_on_hand"
                    type="number"
                    value={newItem.stock_on_hand}
                    onChange={(e) => setNewItem({ ...newItem, stock_on_hand: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <Button onClick={createItem} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Item'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testBulkImport} disabled={loading} className="h-20 flex-col">
                  <Upload className="w-6 h-6 mb-2" />
                  Test Bulk Import
                </Button>
                <Button onClick={() => testExport('json')} disabled={loading} variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Export JSON
                </Button>
                <Button onClick={() => testExport('csv')} disabled={loading} variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Test Suite</CardTitle>
              <CardDescription>Comprehensive testing of all inventory API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runAPITests} disabled={loading} className="w-full h-12">
                {loading ? 'Running Tests...' : 'Run All API Tests'}
              </Button>
              
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Test Results:</h3>
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.test}</div>
                        {result.details && (
                          <div className="text-sm text-gray-600">{result.details}</div>
                        )}
                      </div>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}