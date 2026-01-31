import { NextRequest, NextResponse } from 'next/server';

interface VehicleProfileProps {
  params: { vehicleId: string };
}

export async function GET(
  request: NextRequest,
  { params }: VehicleProfileProps
) {
  try {
    const { vehicleId } = params;
    
    // Mock vehicle data
    const vehicle = {
      id: vehicleId,
      make: 'Honda',
      model: 'Civic',
      year: 2024,
      price: 28500,
      mileage: 12000,
      color: 'Silver',
      vin: '1HGBH41JXMN109186',
      status: 'available',
      location: 'Lot A-1',
      images: ['/api/placeholder/400/300'],
      description: 'Excellent condition Honda Civic with low mileage',
      features: ['Backup Camera', 'Bluetooth', 'USB Ports', 'Air Conditioning'],
      mpg: { city: 32, highway: 42 },
      engine: '2.0L 4-Cylinder',
      transmission: 'CVT Automatic',
      drivetrain: 'Front-Wheel Drive',
      exterior: 'Lunar Silver Metallic',
      interior: 'Black Cloth'
    };

    return NextResponse.json({
      status: 'success',
      data: vehicle
    });
  } catch (error) {
    console.error('Vehicle profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle profile' },
      { status: 500 }
    );
  }
}