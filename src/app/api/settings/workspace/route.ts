import { NextRequest, NextResponse } from "next/server";


export const dynamic = 'force-dynamic';
// Workspace Settings Interface
interface WorkspaceSettings {
  // Organization Details
  organizationName: string;
  legalName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  
  // Contact Information
  primaryEmail: string;
  primaryPhone: string;
  supportEmail: string;
  salesEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Business Hours
  timezone: string;
  businessHours: {
    [key: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  
  // Preferences
  defaultCurrency: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  
  // Data & Privacy
  dataRetentionDays: number;
  autoDeleteLeads: boolean;
  anonymizeData: boolean;
  enableAuditLog: boolean;
  
  // Features
  enabledFeatures: {
    leads: boolean;
    deals: boolean;
    calendar: boolean;
    inventory: boolean;
    reporting: boolean;
    aiAssistant: boolean;
    integrations: boolean;
    automation: boolean;
  };
  
  // Compliance
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  
  // Branding
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Default workspace settings
const defaultWorkspaceSettings: WorkspaceSettings = {
  organizationName: "GhostCRM Organization",
  legalName: "GhostCRM LLC",
  industry: "Technology",
  companySize: "1-10",
  website: "https://ghostcrm.com",
  description: "AI-powered CRM platform for modern businesses",
  
  primaryEmail: "contact@ghostcrm.com",
  primaryPhone: "+1 (555) 123-4567",
  supportEmail: "support@ghostcrm.com",
  salesEmail: "sales@ghostcrm.com",
  address: {
    street: "123 Business Ave",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States"
  },
  
  timezone: "America/Los_Angeles",
  businessHours: {
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: false, start: "09:00", end: "17:00" }
  },
  
  defaultCurrency: "USD",
  defaultLanguage: "en",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  
  dataRetentionDays: 2555, // 7 years
  autoDeleteLeads: false,
  anonymizeData: false,
  enableAuditLog: true,
  
  enabledFeatures: {
    leads: true,
    deals: true,
    calendar: false,
    inventory: false,
    reporting: true,
    aiAssistant: true,
    integrations: true,
    automation: false
  },
  
  gdprCompliance: true,
  ccpaCompliance: true,
  
  primaryColor: "#3B82F6",
  secondaryColor: "#6B7280",
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// In production, this would come from a database
// For now, we'll use localStorage simulation
let workspaceSettings: WorkspaceSettings = { ...defaultWorkspaceSettings };

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: workspaceSettings
    });
  } catch (error) {
    console.error("Error fetching workspace settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch workspace settings" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Validate required fields
    if (!updates.organizationName?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization name is required" 
        },
        { status: 400 }
      );
    }
    
    if (!updates.primaryEmail?.trim() || !isValidEmail(updates.primaryEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Valid primary email is required" 
        },
        { status: 400 }
      );
    }
    
    // Update workspace settings
    workspaceSettings = {
      ...workspaceSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // In production, save to database here
    // await db.workspaceSettings.update({ where: { id: 1 }, data: workspaceSettings });
    
    return NextResponse.json({
      success: true,
      data: workspaceSettings,
      message: "Workspace settings updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating workspace settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update workspace settings" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { field, value } = await request.json();
    
    if (!field) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Field name is required" 
        },
        { status: 400 }
      );
    }
    
    // Update specific field using safer approach
    const updateObject = { ...workspaceSettings };
    
    // Handle nested field updates
    if (field.includes('.')) {
      const keys = field.split('.');
      let current: any = updateObject;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    } else {
      (updateObject as any)[field] = value;
    }
    
    workspaceSettings = updateObject;
    workspaceSettings.updatedAt = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: workspaceSettings,
      message: `${field} updated successfully`
    });
    
  } catch (error) {
    console.error("Error updating workspace field:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update workspace field" 
      },
      { status: 500 }
    );
  }
}

// Reset to defaults endpoint
export async function DELETE(request: NextRequest) {
  try {
    workspaceSettings = { 
      ...defaultWorkspaceSettings,
      createdAt: workspaceSettings.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: workspaceSettings,
      message: "Workspace settings reset to defaults"
    });
    
  } catch (error) {
    console.error("Error resetting workspace settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to reset workspace settings" 
      },
      { status: 500 }
    );
  }
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
