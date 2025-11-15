 "use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { useAuth } from "@/context/AuthContext";
import { FeatureGuard, usePermissionCheck } from "@/middleware/PermissionMiddleware";
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

// Vehicle data interface
interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
  mileage: number;
  price: number;
  cost: number;
  status: 'available' | 'sold' | 'pending' | 'needs_attention' | 'service';
  location: string;
  dateAdded: string;
  lastUpdated: string;
  condition: 'new' | 'used' | 'certified';
  fuelType: string;
  transmission: string;
  bodyType: string;
  engine: string;
  photos: string[];
  notes?: string;
  tenantId: string; // Add tenant isolation
  assignedSalesRep?: string; // For sales rep assignment
}

// Sample vehicle data with tenant isolation
const sampleVehicles: Vehicle[] = [
  {
    id: 'VH001',
    vin: '1HGBH41JXMN109186',
    make: 'Honda',
    model: 'Accord',
    year: 2023,
    trim: 'Sport',
    color: 'Sonic Gray Pearl',
    mileage: 15420,
    price: 28500,
    cost: 25200,
    status: 'available',
    location: 'Lot A-15',
    dateAdded: '2024-09-15',
    lastUpdated: '2024-10-20',
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'CVT',
    bodyType: 'Sedan',
    engine: '1.5L Turbo',
    photos: ['/images/honda-accord-1.jpg'],
    tenantId: 'honda-downtown',
    assignedSalesRep: 'sarah.johnson@honda-downtown.com'
  },
  {
    id: 'VH002',
    vin: '1FTFW1ET5DFC12345',
    make: 'Ford',
    model: 'F-150',
    year: 2024,
    trim: 'Lariat',
    color: 'Oxford White',
    mileage: 0,
    price: 52900,
    cost: 48500,
    status: 'available',
    location: 'Showroom',
    dateAdded: '2024-10-01',
    lastUpdated: '2024-10-25',
    condition: 'new',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Truck',
    engine: '3.5L V6 EcoBoost',
    photos: ['/images/ford-f150-1.jpg'],
    tenantId: 'ford-city',
    assignedSalesRep: 'mike.chen@ford-city.com'
  },
  {
    id: 'VH003',
    vin: '1G1BE5SM3H7123456',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2022,
    trim: 'LT',
    color: 'Summit White',
    mileage: 28750,
    price: 22900,
    cost: 20100,
    status: 'sold',
    location: 'Lot B-08',
    dateAdded: '2024-08-20',
    lastUpdated: '2024-10-22',
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'CVT',
    bodyType: 'Sedan',
    engine: '1.5L Turbo',
    photos: ['/images/chevy-malibu-1.jpg'],
    tenantId: 'chevrolet-valley',
    assignedSalesRep: 'alex.rodriguez@chevrolet-valley.com'
  },
  {
    id: 'VH004',
    vin: 'JTDKARFP0H3123789',
    make: 'Toyota',
    model: 'Prius',
    year: 2023,
    trim: 'LE',
    color: 'Blueprint',
    mileage: 12350,
    price: 27400,
    cost: 24800,
    status: 'pending',
    location: 'Lot A-22',
    dateAdded: '2024-09-30',
    lastUpdated: '2024-10-26',
    condition: 'certified',
    fuelType: 'Hybrid',
    transmission: 'CVT',
    bodyType: 'Hatchback',
    engine: '1.8L Hybrid',
    photos: ['/images/toyota-prius-1.jpg'],
    tenantId: 'toyota-central',
    assignedSalesRep: 'lisa.wang@toyota-central.com'
  },
  {
    id: 'VH005',
    vin: '1C4RJFBG8KC123456',
    make: 'Jeep',
    model: 'Grand Cherokee',
    year: 2021,
    trim: 'Limited',
    color: 'Granite Crystal',
    mileage: 45600,
    price: 34900,
    cost: 31200,
    status: 'needs_attention',
    location: 'Service Bay 2',
    dateAdded: '2024-09-05',
    lastUpdated: '2024-10-24',
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'SUV',
    engine: '3.6L V6',
    photos: ['/images/jeep-cherokee-1.jpg'],
    notes: 'Needs brake service and tire rotation',
    tenantId: 'jeep-west',
    assignedSalesRep: 'david.kim@jeep-west.com'
  },
  {
    id: 'VH006',
    vin: '5NPE34AF4KH123789',
    make: 'Hyundai',
    model: 'Sonata',
    year: 2023,
    trim: 'SEL',
    color: 'Quartz White',
    mileage: 8900,
    price: 26800,
    cost: 24200,
    status: 'available',
    location: 'Lot B-15',
    dateAdded: '2024-10-10',
    lastUpdated: '2024-10-26',
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    engine: '2.5L',
    photos: ['/images/hyundai-sonata-1.jpg'],
    tenantId: 'hyundai-north',
    assignedSalesRep: 'emma.brown@hyundai-north.com'
  }
];

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  // Map user roles to their tenant directories
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-owner', // Tenant admin has same access as owner except billing/creation
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantDir = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantDir}${basePath}`;
}

// Placeholder chart component
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="font-semibold text-lg text-gray-900 mb-4">{title}</div>
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">Chart coming soon</div>
        </div>
      </div>
    </div>
  );
}

// Vehicle Inventory Table Component
function VehicleInventoryTable({ 
  vehicles, 
  bulkMode, 
  selectedVehicles, 
  onSelectVehicle, 
  onSelectAll,
  searchTerm,
  statusFilter,
  makeFilter,
  onGenerateQRCode
}: {
  vehicles: Vehicle[];
  bulkMode: boolean;
  selectedVehicles: string[];
  onSelectVehicle: (vehicleId: string) => void;
  onSelectAll: () => void;
  searchTerm: string;
  statusFilter: string;
  makeFilter: string;
  onGenerateQRCode: (vehicle: Vehicle) => void;
}) {
  const [sortField, setSortField] = useState<keyof Vehicle>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
    
    return matchesSearch && matchesStatus && matchesMake;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      available: 'bg-green-100 text-green-800 border-green-200',
      sold: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      needs_attention: 'bg-red-100 text-red-800 border-red-200',
      service: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const SortButton = ({ field, children }: { field: keyof Vehicle; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {children}
      {sortField === field && (
        <span className="text-blue-600">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {bulkMode && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && filteredVehicles.every(v => selectedVehicles.includes(v.id))}
                    onChange={onSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="vin">VIN</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="make">Vehicle</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="year">Year</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="mileage">Mileage</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="price">Price</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="location">Location</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="dateAdded">Date Added</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                {bulkMode && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => onSelectVehicle(vehicle.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                <td className="px-4 py-4 text-sm font-mono text-gray-600">
                  {vehicle.vin.slice(-8)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {vehicle.make.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.trim} • {vehicle.color}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {vehicle.year}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {vehicle.mileage.toLocaleString()} mi
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  ${vehicle.price.toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(vehicle.status)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {vehicle.location}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {new Date(vehicle.dateAdded).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-800 font-medium text-xs">
                      Edit
                    </button>
                    <button 
                      onClick={() => onGenerateQRCode(vehicle)}
                      className="text-purple-600 hover:text-purple-800 font-medium text-xs flex items-center gap-1"
                      title="Generate QR Code & Digital Window Sticker"
                    >
                      📱 QR
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedVehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🚗</div>
          <div className="text-sm text-gray-500">No vehicles match your current filters</div>
        </div>
      )}
      
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-700">
          Showing {sortedVehicles.length} of {vehicles.length} vehicles
        </div>
      </div>
    </div>
  );
}

function InventoryContent() {
  useRibbonPage({
    context: "inventory",
    enable: ["bulkOps", "export", "share", "data"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });
  
  // Authentication and permission hooks
  const { user } = useAuth();
  const { canManageInventory, isSalesRep, canAccess } = usePermissionCheck();
  const router = useRouter();
  
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [makeFilter, setMakeFilter] = useState("all");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<Vehicle | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  
  // Filter vehicles based on user's tenant and role
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Tenant data filtering utility
  const filterDataByTenant = (data: Vehicle[], tenantId: string) => {
    return data.filter(item => item.tenantId === tenantId);
  };
  
  useEffect(() => {
    let filteredVehicles = sampleVehicles;
    
    // Apply tenant filtering - sales reps only see their company's vehicles
    if (user?.tenantId) {
      filteredVehicles = filterDataByTenant(sampleVehicles, user.tenantId);
    }
    
    // For sales reps, additionally filter to only show vehicles assigned to them
    if (isSalesRep && user?.email) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.assignedSalesRep === user.email || !vehicle.assignedSalesRep
      );
    }
    
    setVehicles(filteredVehicles);
  }, [user, isSalesRep]);
  
  // Real-time analytics (scaffolded) - generate only on client
  const [analytics, setAnalytics] = useState<null | {
    stockLevel: number;
    turnover: number;
    lowStock: number;
    outOfStock: number;
  }>(null);
  
  // Generate analytics only on client to avoid hydration mismatch
  useEffect(() => {
    const available = vehicles.filter(v => v.status === 'available').length;
    const needsAttention = vehicles.filter(v => v.status === 'needs_attention').length;
    const soldThisMonth = vehicles.filter(v => v.status === 'sold').length;
    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
    
    setAnalytics({
      stockLevel: available,
      turnover: totalValue,
      lowStock: needsAttention,
      outOfStock: soldThisMonth,
    });
  }, [vehicles]);

  // Get unique makes for filter dropdown (from filtered vehicles)
  const uniqueMakes = Array.from(new Set(vehicles.map(v => v.make))).sort();

  // Bulk operations
  function handleBulkExport() {
    alert(`Exported ${selectedVehicles.length} selected vehicles`);
    setBulkMode(false);
    setSelectedVehicles([]);
  }
  
  function handleBulkUpdate() {
    alert(`Bulk updated ${selectedVehicles.length} selected vehicles`);
    setBulkMode(false);
    setSelectedVehicles([]);
  }
  
  function handleBulkDelete() {
    if (confirm(`Are you sure you want to delete ${selectedVehicles.length} selected vehicles?`)) {
      alert(`Deleted ${selectedVehicles.length} selected vehicles`);
      setBulkMode(false);
      setSelectedVehicles([]);
    }
  }

  function handleSelectVehicle(vehicleId: string) {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  }

  function handleSelectAll() {
    const filteredVehicleIds = vehicles
      .filter(vehicle => {
        const matchesSearch = searchTerm === '' || 
          vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.year.toString().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
        const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
        
        return matchesSearch && matchesStatus && matchesMake;
      })
      .map(v => v.id);

    if (filteredVehicleIds.every(id => selectedVehicles.includes(id))) {
      setSelectedVehicles(prev => prev.filter(id => !filteredVehicleIds.includes(id)));
    } else {
      setSelectedVehicles(prev => [...new Set([...prev, ...filteredVehicleIds])]);
    }
  }

  // Generate QR Code for vehicle
  async function generateQRCode(vehicle: Vehicle) {
    try {
      const vehicleUrl = `${window.location.origin}/inventory/qr-vehicle-profile/${vehicle.id}`;
      const qrDataURL = await QRCode.toDataURL(vehicleUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setSelectedVehicleForQR(vehicle);
      setQrCodeDataURL(qrDataURL);
      setQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    }
  }

  // Generate bulk QR codes for printing
  async function generateBulkQRCodes(format: 'pdf' | 'zip') {
    if (selectedVehicles.length === 0) {
      alert('Please select vehicles to generate QR codes for.');
      return;
    }

    try {
      const vehiclesToProcess = vehicles.filter(v => selectedVehicles.includes(v.id));
      
      if (format === 'pdf') {
        await generateQRCodePDF(vehiclesToProcess);
      } else {
        await generateQRCodeZip(vehiclesToProcess);
      }
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      alert('Error generating bulk QR codes. Please try again.');
    }
  }

  // Generate PDF with QR codes for printing
  async function generateQRCodePDF(vehicleList: Vehicle[]) {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 2x2 grid layout for QR codes
    const qrSize = 80;
    const margin = 20;
    const spacing = 10;
    let currentPage = 1;
    let qrCount = 0;

    for (const vehicle of vehicleList) {
      const vehicleUrl = `${window.location.origin}/inventory/qr-vehicle-profile/${vehicle.id}`;
      const qrDataURL = await QRCode.toDataURL(vehicleUrl, {
        width: 400,
        margin: 2,
      });

      // Calculate position (2x2 grid)
      const col = qrCount % 2;
      const row = Math.floor((qrCount % 4) / 2);
      const x = margin + col * (qrSize + spacing);
      const y = margin + row * (qrSize + spacing + 30);

      // Add QR code
      pdf.addImage(qrDataURL, 'PNG', x, y, qrSize, qrSize);
      
      // Add vehicle info below QR code
      pdf.setFontSize(10);
      pdf.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, x, y + qrSize + 5);
      pdf.text(`${vehicle.trim} • ${vehicle.color}`, x, y + qrSize + 12);
      pdf.text(`$${vehicle.price.toLocaleString()}`, x, y + qrSize + 19);
      pdf.text(`VIN: ${vehicle.vin.slice(-8)}`, x, y + qrSize + 26);

      qrCount++;

      // Add new page every 4 QR codes
      if (qrCount % 4 === 0 && qrCount < vehicleList.length) {
        pdf.addPage();
        currentPage++;
      }
    }

    // Add footer with generation info
    pdf.setFontSize(8);
    pdf.text(`Generated on ${new Date().toLocaleDateString()} • Total Vehicles: ${vehicleList.length}`, margin, pageHeight - 10);

    pdf.save(`vehicle-qr-codes-${new Date().toISOString().split('T')[0]}.pdf`);
    setBulkMode(false);
    setSelectedVehicles([]);
    alert(`PDF generated with ${vehicleList.length} QR codes!`);
  }

  // Generate ZIP file with individual QR code images
  async function generateQRCodeZip(vehicleList: Vehicle[]) {
    const zip = new JSZip();
    
    for (const vehicle of vehicleList) {
      const vehicleUrl = `${window.location.origin}/inventory/qr-vehicle-profile/${vehicle.id}`;
      const qrDataURL = await QRCode.toDataURL(vehicleUrl, {
        width: 512,
        margin: 3,
      });

      // Convert data URL to blob
      const response = await fetch(qrDataURL);
      const blob = await response.blob();
      
      // Add to ZIP with descriptive filename
      const filename = `${vehicle.year}-${vehicle.make}-${vehicle.model}-${vehicle.id}.png`;
      zip.file(filename, blob);
    }

    // Generate ZIP and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle-qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    setBulkMode(false);
    setSelectedVehicles([]);
    alert(`ZIP file generated with ${vehicleList.length} QR codes!`);
  }
  return (
    <div className="space-y-6">
      {/* Tenant Information Banner */}
      {user && user.tenantId && (
        <div className={`p-4 rounded-lg border ${
          isSalesRep 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isSalesRep ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {isSalesRep ? '👤' : '🏢'}
              </div>
              <div>
                <h3 className={`font-medium ${
                  isSalesRep ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {isSalesRep ? 'Sales Rep View' : 'Manager View'} - {user.tenantId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className={`text-sm ${
                  isSalesRep ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {isSalesRep 
                    ? `Viewing vehicles assigned to ${user.firstName} ${user.lastName} and available vehicles for your dealership`
                    : `Managing all vehicles for your dealership (${vehicles.length} vehicles shown)`
                  }
                </p>
              </div>
            </div>
            <div className={`text-xs px-3 py-1 rounded-full ${
              isSalesRep 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {user.role.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex gap-2 items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Inventory Management</h1>
        
        {/* Add Vehicle Button - Managers and above can add vehicles */}
        <FeatureGuard permissions={['inventory.manage']} roles={['owner', 'admin', 'manager']}>
          <button 
            onClick={() => {
              const newInventoryRoute = getTenantRoute(user, "/new-inventory");
              router.push(newInventoryRoute);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Vehicle
          </button>
        </FeatureGuard>
        
        {/* Bulk Operations - Available to all inventory managers */}
        <FeatureGuard permissions={['inventory.manage']}>
          <button 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              bulkMode 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? "Cancel Bulk" : "Bulk Operations"}
          </button>
        </FeatureGuard>
        
        {/* Tenant info for sales reps */}
        {isSalesRep && user?.tenantId && (
          <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Company: {user.tenantId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        )}
      </div>

      {/* Bulk Operations UI */}
      {bulkMode && selectedVehicles.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700 font-medium">
              {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" 
                onClick={handleBulkExport}
              >
                Export Selected
              </button>
              
              {/* Bulk Update - Only managers and above */}
              <FeatureGuard permissions={['inventory.manage']} roles={['owner', 'admin', 'manager']}>
                <button 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors" 
                  onClick={handleBulkUpdate}
                >
                  Bulk Update
                </button>
              </FeatureGuard>
              
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2" 
                onClick={() => generateBulkQRCodes('pdf')}
              >
                📄 QR PDF
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2" 
                onClick={() => generateBulkQRCodes('zip')}
              >
                📦 QR ZIP
              </button>
              
              {/* Delete - Only managers and above */}
              <FeatureGuard permissions={['inventory.manage']} roles={['owner', 'admin', 'manager']}>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors" 
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </button>
              </FeatureGuard>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            <strong>QR Options:</strong> PDF for easy printing (2x2 grid) • ZIP for individual files
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search vehicles by make, model, VIN, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="service">In Service</option>
            </select>
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Makes</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setMakeFilter("all");
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-green-600 mb-1">Available Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics ? analytics.stockLevel : <span className="text-gray-400">...</span>}
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-blue-600 mb-1">Total Inventory Value</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics ? `$${analytics.turnover.toLocaleString()}` : <span className="text-gray-400">...</span>}
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-yellow-600 mb-1">Needs Attention</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics ? analytics.lowStock : <span className="text-gray-400">...</span>}
              </div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-red-600 mb-1">Sold This Month</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics ? analytics.outOfStock : <span className="text-gray-400">...</span>}
              </div>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Inventory Table */}
      <VehicleInventoryTable
        vehicles={vehicles}
        bulkMode={bulkMode}
        selectedVehicles={selectedVehicles}
        onSelectVehicle={handleSelectVehicle}
        onSelectAll={handleSelectAll}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        makeFilter={makeFilter}
        onGenerateQRCode={generateQRCode}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ChartPlaceholder title="Vehicle Sales Over Time" />
        <ChartPlaceholder title="Inventory Turnover by Model" />
      </div>
      
      <div className="mt-8">
        <ChartPlaceholder title="Vehicle Status & Alerts" />
      </div>
      
      {/* Vehicle Management Tools */}
      {user?.role === "admin" && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900 mb-3">Vehicle Management Tools</div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              Import Vehicle Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Export Vehicle List
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              Reset Vehicle Data
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && selectedVehicleForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                QR Code - {selectedVehicleForQR.year} {selectedVehicleForQR.make} {selectedVehicleForQR.model}
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              {qrCodeDataURL && (
                <div className="mb-4">
                  <img 
                    src={qrCodeDataURL} 
                    alt="Vehicle QR Code"
                    className="mx-auto border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-600 mb-4">
                <p className="font-medium mb-2">Digital Window Sticker & Calculator</p>
                <p className="text-xs">Scan this QR code to view:</p>
                <ul className="text-xs text-left mt-2 space-y-1">
                  <li>• Complete vehicle specifications</li>
                  <li>• MSRP and pricing details</li>
                  <li>• EPA fuel economy ratings</li>
                  <li>• Standard & optional features</li>
                  <li>• Financial payment calculator</li>
                  <li>• Lease calculator</li>
                  <li>• Trade-in estimator</li>
                  <li>• Manufacturer video (when available)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `qr-code-${selectedVehicleForQR.year}-${selectedVehicleForQR.make}-${selectedVehicleForQR.model}.png`;
                    link.href = qrCodeDataURL;
                    link.click();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => window.open(`/inventory/qr-vehicle-profile/${selectedVehicleForQR.id}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Preview Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main export - inventory is now enabled
export default function Inventory() {
  return <InventoryContent />;
}
