"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SalesAgentRoundRobin, sampleSalesAgents, testDriveUtils, TestDriveAppointment, SalesAgent } from "@/lib/salesAgentSystem";

// Enhanced vehicle interface for QR profiles
interface QRVehicleProfile {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
  mileage: number;
  price: number;
  msrp: number;
  condition: 'new' | 'used' | 'certified';
  fuelType: string;
  transmission: string;
  bodyType: string;
  engine: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  photos: string[];
  
  // Window sticker details
  epaRatings: {
    city: number;
    highway: number;
    combined: number;
  };
  
  standardFeatures: string[];
  optionalFeatures: string[];
  safetyFeatures: string[];
  
  // Manufacturer details
  manufacturerVideo?: string;
  factoryWarranty: string;
  
  // Dealer details
  location: string;
  stockNumber: string;
  dateAdded: string;
}

// Sample vehicle data for QR profiles
const sampleQRVehicles: { [key: string]: QRVehicleProfile } = {
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
    msrp: 31200,
    condition: 'used',
    fuelType: 'Gasoline',
    transmission: 'CVT',
    bodyType: 'Sedan',
    engine: '1.5L Turbo',
    drivetrain: 'FWD',
    exteriorColor: 'Sonic Gray Pearl',
    interiorColor: 'Black',
    photos: ['/images/honda-accord-1.jpg'],
    epaRatings: { city: 32, highway: 42, combined: 36 },
    standardFeatures: [
      'Honda Sensing Safety Suite',
      'Apple CarPlay/Android Auto',
      '8-inch Touchscreen',
      'LED Headlights',
      'Dual-Zone Climate Control',
      'Push Button Start',
      'Remote Engine Start'
    ],
    optionalFeatures: [
      'Wireless Phone Charger',
      'Navigation System',
      'Premium Audio System'
    ],
    safetyFeatures: [
      'Collision Mitigation Braking',
      'Road Departure Mitigation',
      'Adaptive Cruise Control',
      'Lane Keeping Assist',
      'Blind Spot Monitoring'
    ],
    manufacturerVideo: 'https://example.com/honda-accord-video',
    factoryWarranty: '3 years/36,000 miles bumper-to-bumper',
    location: 'Lot A-15',
    stockNumber: 'HA2023-001',
    dateAdded: '2024-09-15'
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
    msrp: 54900,
    condition: 'new',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Truck',
    engine: '3.5L V6 EcoBoost',
    drivetrain: '4WD',
    exteriorColor: 'Oxford White',
    interiorColor: 'Black Leather',
    photos: ['/images/ford-f150-1.jpg'],
    epaRatings: { city: 20, highway: 26, combined: 22 },
    standardFeatures: [
      'SYNC 4 Infotainment System',
      '12-inch Touchscreen',
      'Ford Co-Pilot360 2.0',
      'LED Headlights & Taillights',
      'Dual-Zone Climate Control',
      'Remote Start',
      'Trailer Tow Package'
    ],
    optionalFeatures: [
      'Max Recline Seats',
      'Panoramic Moonroof',
      'B&O Sound System',
      'Wireless Charging Pad'
    ],
    safetyFeatures: [
      'Pre-Collision Assist',
      'Blind Spot Information System',
      'Cross-Traffic Alert',
      'Lane-Keeping System',
      'Adaptive Cruise Control'
    ],
    manufacturerVideo: 'https://example.com/ford-f150-video',
    factoryWarranty: '3 years/36,000 miles bumper-to-bumper',
    location: 'Showroom',
    stockNumber: 'FF2024-002',
    dateAdded: '2024-10-01'
  }
};

// Test Drive Scheduling Component
function TestDriveScheduler({ vehicle, onScheduled }: { 
  vehicle: QRVehicleProfile; 
  onScheduled: (appointment: TestDriveAppointment) => void 
}) {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    hasTradeIn: false,
    financingInterest: false,
    preferredTime: 'morning' as 'morning' | 'afternoon' | 'evening',
    specificQuestions: ''
  });
  
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
    agent: SalesAgent;
  } | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<{
    date: string;
    agent: SalesAgent;
    slots: string[];
  }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const agentSystem = new SalesAgentRoundRobin(sampleSalesAgents);
    const slots = testDriveUtils.getAvailableSlots(agentSystem);
    setAvailableSlots(slots.slice(0, 21)); // Show next 3 weeks
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required fields and select a time slot.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentDateTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`);
      
      const appointment: TestDriveAppointment = {
        id: `TD${Date.now()}`,
        vehicleId: vehicle.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        scheduledDateTime: appointmentDateTime.toISOString(),
        duration: 60, // 1 hour
        agentId: selectedSlot.agent.id,
        status: 'scheduled',
        customerPreferences: {
          preferredTime: customerInfo.preferredTime,
          hasTradeIn: customerInfo.hasTradeIn,
          financingInterest: customerInfo.financingInterest,
          specificQuestions: customerInfo.specificQuestions ? [customerInfo.specificQuestions] : []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onScheduled(appointment);
    } catch (error) {
      console.error('Error scheduling test drive:', error);
      alert('Error scheduling test drive. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as { [date: string]: typeof availableSlots });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Schedule Test Drive</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time
            </label>
            <select
              value={customerInfo.preferredTime}
              onChange={(e) => setCustomerInfo({...customerInfo, preferredTime: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 7 PM)</option>
            </select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={customerInfo.hasTradeIn}
              onChange={(e) => setCustomerInfo({...customerInfo, hasTradeIn: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">I have a vehicle to trade in</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={customerInfo.financingInterest}
              onChange={(e) => setCustomerInfo({...customerInfo, financingInterest: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">I'm interested in financing options</span>
          </label>
        </div>

        {/* Specific Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specific Questions or Comments
          </label>
          <textarea
            value={customerInfo.specificQuestions}
            onChange={(e) => setCustomerInfo({...customerInfo, specificQuestions: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any specific features you'd like to learn about or questions you have..."
          />
        </div>

        {/* Time Slot Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Select Date & Time</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 mb-2">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="space-y-2">
                  {slots.map((slot) => 
                    slot.slots.map((time) => (
                      <button
                        key={`${date}-${time}-${slot.agent.id}`}
                        type="button"
                        onClick={() => setSelectedSlot({ date, time, agent: slot.agent })}
                        className={`w-full text-left px-2 py-1 text-xs rounded border ${
                          selectedSlot?.date === date && selectedSlot?.time === time && selectedSlot?.agent.id === slot.agent.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {time} - {slot.agent.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSlot && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Selected Appointment</h5>
            <div className="text-sm text-blue-800">
              <p><strong>Date:</strong> {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> {selectedSlot.time}</p>
              <p><strong>Sales Agent:</strong> {selectedSlot.agent.name}</p>
              <p><strong>Phone:</strong> {selectedSlot.agent.phone}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedSlot}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Test Drive'}
        </button>
      </form>
    </div>
  );
}

// Financial Calculator Component
function FinancialCalculator({ vehicle }: { vehicle: QRVehicleProfile }) {
  const [loanTerm, setLoanTerm] = useState(60);
  const [downPayment, setDownPayment] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tradeInValue, setTradeInValue] = useState(0);
  
  const loanAmount = Math.max(0, vehicle.price - downPayment - tradeInValue);
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
    : 0;
  const totalInterest = (monthlyPayment * loanTerm) - loanAmount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Payment Calculator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Price: ${vehicle.price.toLocaleString()}
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment
            </label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trade-in Value
            </label>
            <input
              type="number"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (months)
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={36}>36 months</option>
              <option value={48}>48 months</option>
              <option value={60}>60 months</option>
              <option value={72}>72 months</option>
              <option value={84}>84 months</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount:</span>
              <span className="font-medium">${loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-bold text-lg text-blue-600">${monthlyPayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-medium">${totalInterest.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-bold">${(vehicle.price + totalInterest).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800">
              * Estimated payments. Actual rates may vary based on credit approval. 
              Contact our finance department for personalized quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QRVehicleProfile() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<QRVehicleProfile | null>(null);
  const [scheduledAppointment, setScheduledAppointment] = useState<TestDriveAppointment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'schedule'>('overview');

  useEffect(() => {
    // In a real app, this would fetch from an API
    const vehicleData = sampleQRVehicles[vehicleId];
    if (vehicleData) {
      setVehicle(vehicleData);
    }
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h1>
          <p className="text-gray-600">The requested vehicle profile could not be found.</p>
        </div>
      </div>
    );
  }

  if (scheduledAppointment) {
    const agentSystem = new SalesAgentRoundRobin(sampleSalesAgents);
    const agent = sampleSalesAgents.find(a => a.id === scheduledAppointment.agentId);
    const confirmationDetails = agent ? testDriveUtils.formatAppointmentDetails(scheduledAppointment, agent, vehicle) : null;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Test Drive Scheduled!</h1>
            <p className="text-gray-600 mb-6">Your test drive appointment has been confirmed.</p>
            
            {confirmationDetails && (
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h3 className="font-bold text-gray-900 mb-4">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Confirmation #:</strong> {confirmationDetails.confirmationNumber}</p>
                  <p><strong>Vehicle:</strong> {confirmationDetails.vehicle}</p>
                  <p><strong>Date:</strong> {confirmationDetails.date}</p>
                  <p><strong>Time:</strong> {confirmationDetails.time}</p>
                  <p><strong>Duration:</strong> {confirmationDetails.duration}</p>
                  <p><strong>Sales Agent:</strong> {confirmationDetails.agent.name}</p>
                  <p><strong>Agent Phone:</strong> {confirmationDetails.agent.phone}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setScheduledAppointment(null)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Schedule Another Test Drive
              </button>
              <p className="text-xs text-gray-500">
                You will receive a confirmation email shortly. Please arrive 15 minutes early for your appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-gray-600">{vehicle.trim} • {vehicle.exteriorColor}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">${vehicle.price.toLocaleString()}</div>
              {vehicle.msrp > vehicle.price && (
                <div className="text-sm text-gray-500">
                  MSRP: <span className="line-through">${vehicle.msrp.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '🏷️ Window Sticker', icon: '' },
              { id: 'calculator', label: '💰 Payment Calculator', icon: '' },
              { id: 'schedule', label: '📅 Schedule Test Drive', icon: '' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Vehicle Images */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🚗</div>
                  <p>Vehicle Photo Placeholder</p>
                </div>
              </div>
              
              {vehicle.manufacturerVideo && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">📹 Manufacturer Video</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">▶️</div>
                      <p className="text-sm">Video player would be embedded here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Specifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div><strong>Engine:</strong> {vehicle.engine}</div>
                    <div><strong>Transmission:</strong> {vehicle.transmission}</div>
                    <div><strong>Drivetrain:</strong> {vehicle.drivetrain}</div>
                    <div><strong>Fuel Type:</strong> {vehicle.fuelType}</div>
                    <div><strong>Body Type:</strong> {vehicle.bodyType}</div>
                    <div><strong>Condition:</strong> {vehicle.condition.toUpperCase()}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} mi</div>
                    <div><strong>Exterior:</strong> {vehicle.exteriorColor}</div>
                    <div><strong>Interior:</strong> {vehicle.interiorColor}</div>
                    <div><strong>VIN:</strong> {vehicle.vin}</div>
                    <div><strong>Stock #:</strong> {vehicle.stockNumber}</div>
                    <div><strong>Location:</strong> {vehicle.location}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⛽ EPA Fuel Economy</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{vehicle.epaRatings.city}</div>
                    <div className="text-sm text-gray-600">City MPG</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{vehicle.epaRatings.highway}</div>
                    <div className="text-sm text-gray-600">Highway MPG</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{vehicle.epaRatings.combined}</div>
                    <div className="text-sm text-gray-600">Combined MPG</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Standard Features</h3>
                <ul className="space-y-1 text-sm">
                  {vehicle.standardFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔒 Safety Features</h3>
                <ul className="space-y-1 text-sm">
                  {vehicle.safetyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Optional Features</h3>
                <ul className="space-y-1 text-sm">
                  {vehicle.optionalFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warranty Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Warranty Information</h3>
              <p className="text-gray-700">{vehicle.factoryWarranty}</p>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <FinancialCalculator vehicle={vehicle} />
        )}

        {activeTab === 'schedule' && (
          <TestDriveScheduler 
            vehicle={vehicle} 
            onScheduled={setScheduledAppointment}
          />
        )}
      </div>
    </div>
  );
}