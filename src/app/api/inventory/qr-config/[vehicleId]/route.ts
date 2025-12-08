import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const { vehicleId, config, features } = await req.json();
    
    // For now, we'll store in memory/mock data
    // In production, you'd save to your database
    console.log('🔧 [QR CONFIG] Saving configuration for vehicle:', vehicleId);
    console.log('📋 [QR CONFIG] Configuration:', config);
    console.log('🎯 [QR CONFIG] Features:', features);
    
    // Mock saving to database
    const qrConfig = {
      id: `qr_${vehicleId}`,
      vehicleId,
      config,
      features,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: "QR configuration saved successfully",
      data: qrConfig
    });
    
  } catch (error) {
    console.error('❌ [QR CONFIG] Error saving configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save QR configuration" 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const { vehicleId } = params;
    
    console.log('🔍 [QR CONFIG] Fetching configuration for vehicle:', vehicleId);
    
    // Mock configuration data
    // In production, you'd fetch from your database
    const mockConfig = {
      id: `qr_${vehicleId}`,
      vehicleId,
      config: {
        vehicleInfo: {
          showPrice: true,
          showMileage: true,
          showFeatures: true,
          showSpecs: true,
          customDescription: "",
          highlightedFeatures: []
        },
        photos: {
          enabled: true,
          selectedPhotos: [],
          allowUploads: false,
          maxPhotos: 10
        },
        testDrive: {
          enabled: true,
          allowScheduling: true,
          availableTimes: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
          requiresApproval: true,
          customMessage: "Schedule your test drive today!"
        },
        contact: {
          enabled: true,
          salesPerson: {
            name: "John Doe",
            phone: "(555) 123-4567",
            email: "john.doe@burchmotors.com"
          },
          dealership: {
            name: "Burch Motors",
            address: "123 Main St, City, ST 12345",
            phone: "(555) 987-6543"
          }
        },
        financing: {
          enabled: true,
          showCalculator: true,
          showIncentives: true,
          customOffers: []
        },
        reviews: {
          enabled: true,
          allowNewReviews: true,
          showRating: true
        }
      },
      features: [
        { id: "vehicle_info", name: "Vehicle Information", enabled: true },
        { id: "photo_gallery", name: "Photo Gallery", enabled: true },
        { id: "test_drive", name: "Test Drive Booking", enabled: true },
        { id: "contact_dealer", name: "Contact Information", enabled: true },
        { id: "financing", name: "Financing Options", enabled: true },
        { id: "reviews", name: "Customer Reviews", enabled: false },
        { id: "location", name: "Dealership Location", enabled: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: mockConfig
    });
    
  } catch (error) {
    console.error('❌ [QR CONFIG] Error fetching configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch QR configuration" 
      },
      { status: 500 }
    );
  }
}