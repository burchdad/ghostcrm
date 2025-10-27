export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 [DEBUG] Testing basic HTTP connectivity...");
  
  try {
    // Test basic HTTP request
    const response = await fetch("https://httpbin.org/get");
    const data = await response.json();
    
    console.log("✅ [DEBUG] Basic HTTP connectivity working");
    return NextResponse.json({ 
      success: true, 
      message: "Basic HTTP connectivity working",
      testResponse: data.url
    });
    
  } catch (error: any) {
    console.log("❌ [DEBUG] Basic HTTP test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}