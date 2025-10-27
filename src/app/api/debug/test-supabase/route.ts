export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  console.log("🔍 [DEBUG] Testing Supabase connection...");
  
  try {
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("count", { count: 'exact', head: true });
      
    if (error) {
      console.log("❌ [DEBUG] Supabase connection failed:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }
    
    console.log("✅ [DEBUG] Supabase connection successful");
    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection working",
      userCount: data?.length || 0
    });
    
  } catch (error: any) {
    console.log("❌ [DEBUG] Connection test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}