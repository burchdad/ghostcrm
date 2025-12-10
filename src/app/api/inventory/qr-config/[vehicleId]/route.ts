import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const { config, features } = await req.json();
    const { vehicleId } = params;
    
    console.log('🔧 [QR CONFIG] Saving configuration for vehicle:', vehicleId);
    
    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 }
      );
    }

    // Update or insert QR configuration
    const { data: qrConfig, error: upsertError } = await supabaseAdmin
      .from("vehicle_qr_configs")
      .upsert({
        vehicle_id: vehicleId,
        organization_id: userOrg.organization_id,
        config,
        features,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error saving QR config:', upsertError);
      return NextResponse.json(
        { error: "Failed to save QR configuration" },
        { status: 500 }
      );
    }
    
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
    
    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 403 }
      );
    }

    // Get vehicle data to ensure it exists and belongs to organization
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from("inventory")
      .select("*")
      .eq("id", vehicleId)
      .eq("organization_id", userOrg.organization_id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Get or create QR configuration for this vehicle
    let { data: qrConfig, error: configError } = await supabaseAdmin
      .from("vehicle_qr_configs")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("organization_id", userOrg.organization_id)
      .single();

    // If no config exists, create a default one
    if (configError || !qrConfig) {
      const defaultConfig = {
        vehicle_id: vehicleId,
        organization_id: userOrg.organization_id,
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
              name: "Sales Representative",
              phone: "",
              email: ""
            },
            dealership: {
              name: "",
              address: "",
              phone: ""
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
        ]
      };

      const { data: newConfig, error: createError } = await supabaseAdmin
        .from("vehicle_qr_configs")
        .insert(defaultConfig)
        .select()
        .single();

      if (createError) {
        console.error('Error creating QR config:', createError);
        return NextResponse.json(
          { error: "Failed to create QR configuration" },
          { status: 500 }
        );
      }

      qrConfig = newConfig;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: qrConfig.id,
        vehicleId: qrConfig.vehicle_id,
        config: qrConfig.config,
        features: qrConfig.features,
        createdAt: qrConfig.created_at,
        updatedAt: qrConfig.updated_at
      }
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