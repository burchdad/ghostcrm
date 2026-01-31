"use client";
import { useState, useEffect } from "react";

// QR Analytics Interface
interface QRAnalytics {
  vehicleId: string;
  totalScans: number;
  uniqueVisitors: number;
  testDrivesScheduled: number;
  conversionRate: number;
  lastScanned: string;
  topReferrers: { source: string; count: number }[];
  hourlyScans: { hour: number; count: number }[];
  weeklyTrend: { date: string; scans: number }[];
}

// Sample analytics data
const sampleAnalytics: QRAnalytics[] = [
  {
    vehicleId: 'VH001',
    totalScans: 87,
    uniqueVisitors: 62,
    testDrivesScheduled: 12,
    conversionRate: 19.4,
    lastScanned: '2024-10-27T14:30:00Z',
    topReferrers: [
      { source: 'QR Code - Lot', count: 45 },
      { source: 'QR Code - Showroom', count: 23 },
      { source: 'Direct Link', count: 19 }
    ],
    hourlyScans: [
      { hour: 9, count: 8 }, { hour: 10, count: 12 }, { hour: 11, count: 15 },
      { hour: 12, count: 6 }, { hour: 13, count: 9 }, { hour: 14, count: 18 },
      { hour: 15, count: 14 }, { hour: 16, count: 11 }, { hour: 17, count: 8 }
    ],
    weeklyTrend: [
      { date: '2024-10-21', scans: 8 }, { date: '2024-10-22', scans: 12 },
      { date: '2024-10-23', scans: 15 }, { date: '2024-10-24', scans: 18 },
      { date: '2024-10-25', scans: 14 }, { date: '2024-10-26', scans: 11 },
      { date: '2024-10-27', scans: 9 }
    ]
  },
  {
    vehicleId: 'VH002',
    totalScans: 134,
    uniqueVisitors: 98,
    testDrivesScheduled: 23,
    conversionRate: 23.5,
    lastScanned: '2024-10-27T16:15:00Z',
    topReferrers: [
      { source: 'QR Code - Showroom', count: 67 },
      { source: 'QR Code - Lot', count: 34 },
      { source: 'Social Media Share', count: 21 },
      { source: 'Direct Link', count: 12 }
    ],
    hourlyScans: [
      { hour: 9, count: 12 }, { hour: 10, count: 18 }, { hour: 11, count: 22 },
      { hour: 12, count: 8 }, { hour: 13, count: 14 }, { hour: 14, count: 25 },
      { hour: 15, count: 19 }, { hour: 16, count: 16 }, { hour: 17, count: 12 }
    ],
    weeklyTrend: [
      { date: '2024-10-21', scans: 15 }, { date: '2024-10-22', scans: 19 },
      { date: '2024-10-23', scans: 23 }, { date: '2024-10-24', scans: 28 },
      { date: '2024-10-25', scans: 21 }, { date: '2024-10-26', scans: 18 },
      { date: '2024-10-27', scans: 10 }
    ]
  }
];

// Vehicle data for dashboard
const vehicleData = {
  'VH001': { make: 'Honda', model: 'Accord', year: 2023, price: 28500 },
  'VH002': { make: 'Ford', model: 'F-150', year: 2024, price: 52900 },
  'VH003': { make: 'Chevrolet', model: 'Malibu', year: 2022, price: 22900 },
  'VH004': { make: 'Toyota', model: 'Prius', year: 2023, price: 27400 },
  'VH005': { make: 'Jeep', model: 'Grand Cherokee', year: 2021, price: 34900 },
  'VH006': { make: 'Hyundai', model: 'Sonata', year: 2023, price: 26800 }
};

export default function QRAnalyticsDashboard() {
  const [analytics] = useState(sampleAnalytics);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Calculate overall metrics
  const totalScans = analytics.reduce((sum, item) => sum + item.totalScans, 0);
  const totalUniqueVisitors = analytics.reduce((sum, item) => sum + item.uniqueVisitors, 0);
  const totalTestDrives = analytics.reduce((sum, item) => sum + item.testDrivesScheduled, 0);
  const overallConversionRate = totalUniqueVisitors > 0 ? (totalTestDrives / totalUniqueVisitors * 100) : 0;

  const selectedAnalytics = selectedVehicle 
    ? analytics.find(a => a.vehicleId === selectedVehicle)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 QR Code Analytics</h1>
              <p className="text-gray-600">Track QR code performance and customer engagement</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                📥 Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">Total QR Scans</div>
                <div className="text-3xl font-bold text-gray-900">{totalScans.toLocaleString()}</div>
                <div className="text-sm text-green-600">+12% vs last period</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <div className="text-blue-600 text-xl">📱</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-600 mb-1">Unique Visitors</div>
                <div className="text-3xl font-bold text-gray-900">{totalUniqueVisitors.toLocaleString()}</div>
                <div className="text-sm text-green-600">+8% vs last period</div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <div className="text-green-600 text-xl">👥</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-600 mb-1">Test Drives Scheduled</div>
                <div className="text-3xl font-bold text-gray-900">{totalTestDrives}</div>
                <div className="text-sm text-green-600">+23% vs last period</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <div className="text-purple-600 text-xl">📅</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-600 mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold text-gray-900">{overallConversionRate.toFixed(1)}%</div>
                <div className="text-sm text-green-600">+5.2% vs last period</div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <div className="text-orange-600 text-xl">📈</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Vehicle QR Performance</h2>
            <p className="text-gray-600">Click on a vehicle to view detailed analytics</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Scans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Visitors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Drives
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Scanned
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.map((item) => {
                  const vehicle = vehicleData[item.vehicleId as keyof typeof vehicleData];
                  return (
                    <tr 
                      key={item.vehicleId} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedVehicle === item.vehicleId ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedVehicle(
                        selectedVehicle === item.vehicleId ? null : item.vehicleId
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {vehicle.make.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${vehicle.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.totalScans.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.uniqueVisitors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.testDrivesScheduled}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.conversionRate >= 20 
                            ? 'bg-green-100 text-green-800'
                            : item.conversionRate >= 15
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.lastScanned).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/inventory/qr-vehicle-profile/${item.vehicleId}`, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View QR Page
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Analytics for Selected Vehicle */}
        {selectedAnalytics && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detailed Analytics - {vehicleData[selectedAnalytics.vehicleId as keyof typeof vehicleData].year} {vehicleData[selectedAnalytics.vehicleId as keyof typeof vehicleData].make} {vehicleData[selectedAnalytics.vehicleId as keyof typeof vehicleData].model}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Scan Distribution */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hourly Scan Distribution</h4>
                  <div className="space-y-2">
                    {selectedAnalytics.hourlyScans.map((scan) => (
                      <div key={scan.hour} className="flex items-center">
                        <div className="w-16 text-sm text-gray-600">
                          {scan.hour}:00
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                          <div 
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ 
                              width: `${(scan.count / Math.max(...selectedAnalytics.hourlyScans.map(s => s.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm text-gray-900">
                          {scan.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Trend */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Scan Trend</h4>
                  <div className="space-y-2">
                    {selectedAnalytics.weeklyTrend.map((day) => (
                      <div key={day.date} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                          <div 
                            className="bg-green-600 h-4 rounded-full"
                            style={{ 
                              width: `${(day.scans / Math.max(...selectedAnalytics.weeklyTrend.map(d => d.scans))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm text-gray-900">
                          {day.scans}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Referrers */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Top Referrer Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedAnalytics.topReferrers.map((referrer, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {referrer.source}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {referrer.count}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((referrer.count / selectedAnalytics.totalScans) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Management Tools */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🛠️ QR Code Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">📊</div>
              <div className="font-medium text-gray-900">Analytics Export</div>
              <div className="text-sm text-gray-600">Download detailed analytics reports</div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">🔄</div>
              <div className="font-medium text-gray-900">Regenerate QR Codes</div>
              <div className="text-sm text-gray-600">Update QR codes with new tracking</div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">📱</div>
              <div className="font-medium text-gray-900">Custom QR Templates</div>
              <div className="text-sm text-gray-600">Create branded QR code designs</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}