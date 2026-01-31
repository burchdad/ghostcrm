"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Vehicle data interface (matches the main inventory)
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
  // Extended window sticker data
  msrp?: number;
  dealerPrice?: number;
  rebates?: number;
  epaCity?: number;
  epaHighway?: number;
  epaCombined?: number;
  safety?: {
    rating: number;
    features: string[];
  };
  features?: string[];
  warranty?: {
    basic: string;
    powertrain: string;
    roadside: string;
  };
  manufacturerVideo?: string;
}

// Extended sample data with window sticker information
const extendedVehicleData: { [key: string]: Vehicle } = {
  'VH001': {
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
    msrp: 32500,
    dealerPrice: 28500,
    rebates: 1000,
    status: 'available',
    location: 'Lot A-15',
    dateAdded: '2024-09-15',
    lastUpdated: '2024-10-20',
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'CVT',
    bodyType: 'Sedan',
    engine: '1.5L Turbo',
    epaCity: 32,
    epaHighway: 42,
    epaCombined: 36,
    photos: ['/images/honda-accord-1.jpg'],
    safety: {
      rating: 5,
      features: ['Honda Sensing Suite', 'Collision Mitigation Braking', 'Road Departure Mitigation', 'Adaptive Cruise Control']
    },
    features: [
      'Apple CarPlay/Android Auto',
      'Wireless Charging Pad',
      'Dual-Zone Climate Control',
      'LED Headlights',
      'Remote Engine Start',
      '8-Way Power Driver Seat',
      'Sport Pedals',
      '19-inch Alloy Wheels'
    ],
    warranty: {
      basic: '3 years/36,000 miles',
      powertrain: '5 years/60,000 miles',
      roadside: '3 years/36,000 miles'
    },
    manufacturerVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  'VH002': {
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
    msrp: 58900,
    dealerPrice: 52900,
    rebates: 2500,
    status: 'available',
    location: 'Showroom',
    dateAdded: '2024-10-01',
    lastUpdated: '2024-10-25',
    condition: 'new',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Truck',
    engine: '3.5L V6 EcoBoost',
    epaCity: 20,
    epaHighway: 26,
    epaCombined: 22,
    photos: ['/images/ford-f150-1.jpg'],
    safety: {
      rating: 5,
      features: ['Ford Co-Pilot360', 'Pre-Collision Assist', 'Blind Spot Monitoring', 'Lane-Keeping System']
    },
    features: [
      'SYNC 4 Infotainment',
      'Pro Power Onboard',
      'Leather-Trimmed Seats',
      'Heated/Cooled Front Seats',
      'Panoramic Vista Roof',
      '18-inch Machined Aluminum Wheels',
      'Trailer Tow Package',
      'Tailgate Step'
    ],
    warranty: {
      basic: '3 years/36,000 miles',
      powertrain: '5 years/60,000 miles',
      roadside: '5 years/60,000 miles'
    },
    manufacturerVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
  // Add more vehicles as needed
};

// Financial Calculator Component
function FinancialCalculator({ vehicle }: { vehicle: Vehicle }) {
  const [calculatorMode, setCalculatorMode] = useState<'purchase' | 'lease'>('purchase');
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeValue, setTradeValue] = useState(0);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(6.5);
  const [leaseTermMonths, setLeaseTermMonths] = useState(36);
  const [milesPerYear, setMilesPerYear] = useState(12000);

  const calculateMonthlyPayment = () => {
    const principal = (vehicle.dealerPrice || vehicle.price) - downPayment - tradeValue;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment;
  };

  const calculateLeasePayment = () => {
    const msrp = vehicle.msrp || vehicle.price;
    const residualPercent = 0.55; // Typical 55% for 36 months
    const residualValue = msrp * residualPercent;
    const depreciation = (msrp - residualValue) / leaseTermMonths;
    const financing = (msrp + residualValue) * (interestRate / 100 / 12);
    
    return depreciation + financing;
  };

  const monthlyPayment = calculatorMode === 'purchase' 
    ? calculateMonthlyPayment() 
    : calculateLeasePayment();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Financial Calculator</h3>
      
      {/* Calculator Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCalculatorMode('purchase')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            calculatorMode === 'purchase' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Purchase
        </button>
        <button
          onClick={() => setCalculatorMode('lease')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            calculatorMode === 'lease' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Lease
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Price
            </label>
            <div className="text-lg font-bold text-green-600">
              ${(vehicle.dealerPrice || vehicle.price).toLocaleString()}
            </div>
          </div>

          {calculatorMode === 'purchase' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade-In Value
                </label>
                <input
                  type="number"
                  value={tradeValue}
                  onChange={(e) => setTradeValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (months)
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                  <option value={60}>60 months</option>
                  <option value={72}>72 months</option>
                  <option value={84}>84 months</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Term (months)
                </label>
                <select
                  value={leaseTermMonths}
                  onChange={(e) => setLeaseTermMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Mileage
                </label>
                <select
                  value={milesPerYear}
                  onChange={(e) => setMilesPerYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10000}>10,000 miles</option>
                  <option value={12000}>12,000 miles</option>
                  <option value={15000}>15,000 miles</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Payment Calculation</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Price:</span>
              <span className="font-medium">${(vehicle.dealerPrice || vehicle.price).toLocaleString()}</span>
            </div>
            
            {calculatorMode === 'purchase' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-medium">-${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trade-In Value:</span>
                  <span className="font-medium">-${tradeValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Amount Financed:</span>
                  <span className="font-medium">${((vehicle.dealerPrice || vehicle.price) - downPayment - tradeValue).toLocaleString()}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between border-t pt-2">
              <span className="text-lg font-bold text-gray-900">
                Monthly Payment:
              </span>
              <span className="text-lg font-bold text-green-600">
                ${monthlyPayment.toFixed(0)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleQRProfile() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const vehicleData = extendedVehicleData[vehicleId];
    if (vehicleData) {
      setVehicle(vehicleData);
    }
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <div className="text-xl text-gray-600">Vehicle not found</div>
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with QR Code */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Digital Window Sticker
              </span>
            </div>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              📱 Show QR Code
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-4">QR Code for {vehicle.year} {vehicle.make} {vehicle.model}</h3>
                <div className="bg-gray-100 p-8 rounded-lg mb-4">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <div className="text-sm text-gray-500">QR Code would display here</div>
                      <div className="text-xs text-gray-400 mt-2 break-all">{currentUrl}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Image */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚗</div>
                  <div className="text-sm text-gray-500">Vehicle Image</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">VIN:</span>
                  <span className="ml-2 font-mono">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-gray-600">Condition:</span>
                  <span className="ml-2 capitalize">{vehicle.condition}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mileage:</span>
                  <span className="ml-2">{vehicle.mileage.toLocaleString()} miles</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2">{vehicle.location}</span>
                </div>
              </div>
            </div>

            {/* Manufacturer Video */}
            {vehicle.manufacturerVideo && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎥 Vehicle in Motion</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">▶️</div>
                    <div className="text-sm text-gray-500">Manufacturer Video</div>
                    <div className="text-xs text-gray-400 mt-1">Video player would embed here</div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Calculator */}
            <FinancialCalculator vehicle={vehicle} />
          </div>

          {/* Right Column - Window Sticker Info */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Pricing</h3>
              <div className="space-y-3">
                {vehicle.msrp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">MSRP:</span>
                    <span className="font-medium">${vehicle.msrp.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Our Price:</span>
                  <span className="font-bold text-green-600">${(vehicle.dealerPrice || vehicle.price).toLocaleString()}</span>
                </div>
                {vehicle.rebates && vehicle.rebates > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Rebates:</span>
                    <span className="font-medium text-red-600">-${vehicle.rebates.toLocaleString()}</span>
                  </div>
                )}
                {vehicle.msrp && (
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">You Save:</span>
                    <span className="font-bold text-green-600">${(vehicle.msrp - (vehicle.dealerPrice || vehicle.price)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* EPA Ratings */}
            {vehicle.epaCity && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⛽ EPA Fuel Economy</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{vehicle.epaCity}</div>
                    <div className="text-xs text-gray-600">CITY MPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{vehicle.epaHighway}</div>
                    <div className="text-xs text-gray-600">HIGHWAY MPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{vehicle.epaCombined}</div>
                    <div className="text-xs text-gray-600">COMBINED MPG</div>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Rating */}
            {vehicle.safety && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Safety Rating</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-yellow-500">
                    {'⭐'.repeat(vehicle.safety.rating)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {vehicle.safety.rating}/5 Star Overall Rating
                  </div>
                </div>
                <div className="space-y-2">
                  {vehicle.safety.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {vehicle.features && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Key Features</h3>
                <div className="space-y-2">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty */}
            {vehicle.warranty && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Warranty</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Basic:</span>
                    <span className="ml-2 font-medium">{vehicle.warranty.basic}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Powertrain:</span>
                    <span className="ml-2 font-medium">{vehicle.warranty.powertrain}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Roadside:</span>
                    <span className="ml-2 font-medium">{vehicle.warranty.roadside}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}