import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// AI-powered field mapping and data parsing for leads
interface AILeadFieldMapping {
  detectedFields: { [key: string]: string };
  confidence: number;
  suggestions: string[];
}

interface ParsedLeadItem {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  source?: string;
  lead_score?: number;
  status?: string;
  stage?: string;
  value?: number;
  priority?: string;
  notes?: string;
  tags?: string[];
  expected_close_date?: string;
  probability?: number;
  campaign?: string;
  referral_source?: string;
  [key: string]: any;
}

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * AI-powered field mapping to intelligently detect and map CSV fields for leads
 */
function performAILeadFieldMapping(sampleItems: any[]): AILeadFieldMapping {
  const fieldMappings: { [key: string]: string } = {};
  const suggestions: string[] = [];
  let totalConfidence = 0;
  
  // Get all unique field names from sample items
  const allFields = new Set<string>();
  sampleItems.forEach(item => {
    Object.keys(item).forEach(key => allFields.add(key.toLowerCase()));
  });
  
  const targetFields = {
    full_name: ['name', 'full_name', 'fullname', 'contact_name', 'lead_name', 'customer_name', 'client_name'],
    first_name: ['first_name', 'firstname', 'fname', 'given_name', 'forename'],
    last_name: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
    email: ['email', 'email_address', 'e_mail', 'contact_email', 'mail', 'email_id'],
    phone: ['phone', 'phone_number', 'telephone', 'mobile', 'cell', 'contact_phone', 'tel', 'phone_no'],
    company: ['company', 'organization', 'business', 'employer', 'corp', 'firm', 'business_name', 'org'],
    job_title: ['title', 'job_title', 'position', 'role', 'designation', 'job_position', 'work_title'],
    website: ['website', 'url', 'site', 'web', 'homepage', 'domain', 'web_address'],
    address: ['address', 'street', 'street_address', 'addr', 'location', 'physical_address'],
    city: ['city', 'town', 'municipality', 'locality'],
    state: ['state', 'province', 'region', 'territory', 'st'],
    zip_code: ['zip', 'zip_code', 'postal_code', 'postcode', 'zipcode', 'post_code'],
    country: ['country', 'nation', 'nationality', 'country_code'],
    source: ['source', 'lead_source', 'origin', 'channel', 'campaign_source', 'referrer'],
    lead_score: ['score', 'lead_score', 'rating', 'grade', 'priority_score', 'qualification_score'],
    status: ['status', 'lead_status', 'state', 'condition'],
    stage: ['stage', 'lead_stage', 'pipeline_stage', 'sales_stage', 'funnel_stage'],
    value: ['value', 'deal_value', 'potential_value', 'opportunity_value', 'revenue', 'amount'],
    priority: ['priority', 'importance', 'urgency', 'lead_priority'],
    notes: ['notes', 'comments', 'description', 'remarks', 'details', 'info', 'additional_info'],
    campaign: ['campaign', 'campaign_name', 'marketing_campaign', 'promo', 'promotion'],
    referral_source: ['referral', 'referred_by', 'referral_source', 'reference', 'ref_source']
  };
  
  // AI field mapping using fuzzy matching and context analysis
  for (const [targetField, possibleNames] of Object.entries(targetFields)) {
    let bestMatch = '';
    let bestScore = 0;
    
    for (const fieldName of allFields) {
      for (const possibleName of possibleNames) {
        // Exact match gets highest score
        if (fieldName === possibleName) {
          bestMatch = fieldName;
          bestScore = 1.0;
          break;
        }
        
        // Partial match scoring
        if (fieldName.includes(possibleName) || possibleName.includes(fieldName)) {
          const score = Math.max(fieldName.length, possibleName.length) / 
                       Math.min(fieldName.length, possibleName.length) * 0.8;
          if (score > bestScore) {
            bestMatch = fieldName;
            bestScore = score;
          }
        }
        
        // Fuzzy matching for common variations
        if (levenshteinDistance(fieldName, possibleName) <= 2 && bestScore < 0.7) {
          const score = 0.6;
          if (score > bestScore) {
            bestMatch = fieldName;
            bestScore = score;
          }
        }
      }
      if (bestScore === 1.0) break;
    }
    
    if (bestMatch && bestScore > 0.5) {
      fieldMappings[targetField] = bestMatch;
      totalConfidence += bestScore;
      
      if (bestScore < 0.9) {
        suggestions.push(`Field '${bestMatch}' mapped to '${targetField}' (confidence: ${(bestScore * 100).toFixed(0)}%)`);
      }
    }
  }
  
  return {
    detectedFields: fieldMappings,
    confidence: totalConfidence / Object.keys(targetFields).length,
    suggestions
  };
}

/**
 * Calculate Levenshtein distance for fuzzy string matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * AI-powered data parsing and cleaning for leads
 */
function parseLeadItemWithAI(rawItem: any, fieldMapping: { [key: string]: string }): ParsedLeadItem {
  const parsed: ParsedLeadItem = {};
  
  // Helper function to get field value using AI mapping
  const getFieldValue = (targetField: string, fallbacks: string[] = []): any => {
    // Try AI-mapped field first
    if (fieldMapping[targetField] && rawItem[fieldMapping[targetField]] !== undefined) {
      return rawItem[fieldMapping[targetField]];
    }
    
    // Try fallback fields
    for (const fallback of fallbacks) {
      if (rawItem[fallback] !== undefined) {
        return rawItem[fallback];
      }
    }
    
    // Try direct field name
    return rawItem[targetField];
  };
  
  // Parse and clean data with AI assistance
  try {
    // Name fields with intelligent parsing
    parsed.full_name = cleanAndValidateText(getFieldValue('full_name', ['name', 'contact_name']));
    parsed.first_name = cleanAndValidateText(getFieldValue('first_name', ['fname']));
    parsed.last_name = cleanAndValidateText(getFieldValue('last_name', ['lname']));
    
    // If we have full_name but not first/last, split it intelligently
    if (parsed.full_name && (!parsed.first_name || !parsed.last_name)) {
      const nameParts = parsed.full_name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        parsed.first_name = parsed.first_name || nameParts[0];
        parsed.last_name = parsed.last_name || nameParts.slice(1).join(' ');
      }
    }
    
    // Contact information with validation
    parsed.email = cleanAndValidateEmail(getFieldValue('email', ['email_address', 'mail']));
    parsed.phone = cleanAndValidatePhone(getFieldValue('phone', ['telephone', 'mobile']));
    
    // Company information
    parsed.company = cleanAndValidateText(getFieldValue('company', ['organization', 'business']));
    parsed.job_title = cleanAndValidateText(getFieldValue('job_title', ['title', 'position']));
    parsed.website = cleanAndValidateUrl(getFieldValue('website', ['url', 'site']));
    
    // Address information
    parsed.address = cleanAndValidateText(getFieldValue('address', ['street_address']));
    parsed.city = cleanAndValidateText(getFieldValue('city', ['town']));
    parsed.state = cleanAndValidateText(getFieldValue('state', ['province']));
    parsed.zip_code = cleanAndValidateText(getFieldValue('zip_code', ['zip', 'postal_code']));
    parsed.country = cleanAndValidateText(getFieldValue('country', ['nation']));
    
    // Lead metadata
    parsed.source = cleanAndValidateText(getFieldValue('source', ['lead_source', 'origin'])) || 'AI Bulk Import';
    parsed.lead_score = parseNumber(getFieldValue('lead_score', ['score', 'rating'])) || 0;
    parsed.status = cleanAndValidateText(getFieldValue('status', ['lead_status'])) || 'new';
    parsed.stage = cleanAndValidateText(getFieldValue('stage', ['lead_stage'])) || 'new';
    parsed.value = parseNumber(getFieldValue('value', ['deal_value', 'amount'])) || 0;
    parsed.priority = cleanAndValidateText(getFieldValue('priority', ['importance'])) || 'medium';
    parsed.notes = cleanAndValidateText(getFieldValue('notes', ['comments', 'description']));
    parsed.campaign = cleanAndValidateText(getFieldValue('campaign', ['campaign_name']));
    parsed.referral_source = cleanAndValidateText(getFieldValue('referral_source', ['referred_by']));
    
    // Date parsing
    const closeDate = getFieldValue('expected_close_date', ['close_date', 'target_date']);
    if (closeDate) {
      parsed.expected_close_date = parseDate(closeDate);
    }
    
    // Probability parsing
    parsed.probability = parseNumber(getFieldValue('probability', ['close_probability'])) || 0;
    if (parsed.probability > 100) parsed.probability = parsed.probability / 100; // Convert percentage to decimal
    
    // Tags parsing (handle comma-separated values)
    const tagsValue = getFieldValue('tags', ['labels', 'categories']);
    if (tagsValue) {
      parsed.tags = typeof tagsValue === 'string' 
        ? tagsValue.split(',').map(tag => tag.trim()).filter(Boolean)
        : Array.isArray(tagsValue) ? tagsValue : [];
    }
    
  } catch (error) {
    console.error('Error parsing lead item with AI:', error);
  }
  
  return parsed;
}

// Helper functions for data cleaning and validation
function cleanAndValidateText(value: any): string | undefined {
  if (!value) return undefined;
  const cleaned = String(value).trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanAndValidateEmail(value: any): string | undefined {
  if (!value) return undefined;
  const email = String(value).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : undefined;
}

function cleanAndValidatePhone(value: any): string | undefined {
  if (!value) return undefined;
  const phone = String(value).replace(/\D/g, ''); // Remove non-digits
  return phone.length >= 10 ? phone : undefined;
}

function cleanAndValidateUrl(value: any): string | undefined {
  if (!value) return undefined;
  let url = String(value).trim();
  if (url && !url.startsWith('http')) {
    url = 'https://' + url;
  }
  try {
    new URL(url);
    return url;
  } catch {
    return undefined;
  }
}

function parseNumber(value: any): number | undefined {
  if (!value) return undefined;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? undefined : parsed;
}

function parseDate(value: any): string | undefined {
  if (!value) return undefined;
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check authentication using our server utility
    if (!(await isAuthenticated(req))) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(JSON.stringify({ error: "User organization not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { leads = [], useAI = true } = body;
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(JSON.stringify({ error: "No leads provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`🤖 [AI LEADS BULK] Processing ${leads.length} leads with AI=${useAI} for org ${user.organizationId}`);

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
      aiAnalysis: null as AILeadFieldMapping | null,
      processedLeads: [] as any[]
    };

    // AI-powered field mapping analysis
    let fieldMapping: { [key: string]: string } = {};
    if (useAI && leads.length > 0) {
      console.log('🧠 [AI LEADS] Performing AI field mapping analysis...');
      const sampleSize = Math.min(5, leads.length);
      const sampleItems = leads.slice(0, sampleSize);
      
      results.aiAnalysis = performAILeadFieldMapping(sampleItems);
      fieldMapping = results.aiAnalysis.detectedFields;
      
      console.log(`🎯 [AI LEADS] Field mapping confidence: ${(results.aiAnalysis.confidence * 100).toFixed(1)}%`);
      console.log(`🔍 [AI LEADS] Detected fields:`, Object.keys(fieldMapping));
      
      if (results.aiAnalysis.suggestions.length > 0) {
        console.log('💡 [AI LEADS] Mapping suggestions:', results.aiAnalysis.suggestions);
      }
    }

    // Process each lead with AI enhancement
    for (let i = 0; i < leads.length; i++) {
      const leadData = leads[i];
      
      try {
        // AI-powered data parsing and cleaning
        const parsedLead = useAI 
          ? parseLeadItemWithAI(leadData, fieldMapping)
          : leadData; // Fallback to original data if AI is disabled
        
        console.log(`📋 [AI LEADS] Processing lead ${i + 1}/${leads.length}: ${parsedLead.full_name || parsedLead.email || 'Unknown'}`);

        // Create / upsert contact first if provided
        let contactId: string | null = null;
        if (parsedLead.email || parsedLead.phone) {
          const contactData = {
            organization_id: user.organizationId,
            first_name: parsedLead.first_name || parsedLead.full_name?.split(" ")[0] || "",
            last_name: parsedLead.last_name || parsedLead.full_name?.split(" ").slice(1).join(" ") || "",
            email: parsedLead.email || null,
            phone: parsedLead.phone || null,
            company: parsedLead.company || null,
            job_title: parsedLead.job_title || null,
            website: parsedLead.website || null,
            address: parsedLead.address || null,
            city: parsedLead.city || null,
            state: parsedLead.state || null,
            zip_code: parsedLead.zip_code || null,
            country: parsedLead.country || null,
          };

          const { data: contact, error: contactError } = await supabaseAdmin
            .from("contacts")
            .upsert(contactData, { 
              onConflict: parsedLead.email ? "organization_id,email" : "organization_id,phone",
              ignoreDuplicates: false 
            })
            .select("id")
            .single();

          if (!contactError && contact) {
            contactId = contact.id;
          } else if (contactError) {
            console.warn(`⚠️ [AI LEADS] Contact upsert warning for ${parsedLead.email}:`, contactError.message);
          }
        }

        // Create lead with AI-enhanced data
        const leadInsertData = {
          organization_id: user.organizationId,
          contact_id: contactId,
          title: parsedLead.full_name || parsedLead.first_name + " " + parsedLead.last_name || "Imported Lead",
          email: parsedLead.email || null,
          description: parsedLead.notes || "",
          value: parsedLead.value || 0,
          currency: "USD",
          stage: parsedLead.stage || "new",
          priority: parsedLead.priority || "medium",
          source: parsedLead.source || "AI_bulk_import",
          assigned_to: "",
          expected_close_date: parsedLead.expected_close_date || null,
          probability: parsedLead.probability || 0,
          lead_score: parsedLead.lead_score || 0,
          tags: parsedLead.tags || [],
          custom_fields: {
            campaign: parsedLead.campaign,
            referral_source: parsedLead.referral_source,
            ai_processed: useAI,
            import_timestamp: new Date().toISOString()
          }
        };

        const { data: createdLead, error } = await supabaseAdmin
          .from("leads")
          .insert(leadInsertData)
          .select("id")
          .single();

        if (error) {
          console.error(`❌ [AI LEADS] Error creating lead for ${parsedLead.full_name}:`, error);
          results.failed++;
          results.errors.push(`Failed to create lead for ${parsedLead.full_name || parsedLead.email}: ${error.message}`);
        } else {
          results.created++;
          results.processedLeads.push({
            id: createdLead.id,
            name: parsedLead.full_name,
            email: parsedLead.email,
            source: parsedLead.source
          });
          console.log(`✅ [AI LEADS] Successfully created lead: ${parsedLead.full_name} (ID: ${createdLead.id})`);
        }

      } catch (err) {
        console.error(`❌ [AI LEADS] Error processing lead ${i + 1}:`, err);
        results.failed++;
        const leadIdentifier = leadData.fullName || leadData.full_name || leadData.email || `Lead ${i + 1}`;
        results.errors.push(`Failed to process ${leadIdentifier}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Log audit event for AI-powered bulk import
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "lead",
      entity_id: null, // bulk operation, no specific entity ID
      action: "bulk_import_ai",
      user_id: user.id,
      details: { 
        created: results.created, 
        failed: results.failed,
        ai_enabled: useAI,
        field_mapping_confidence: results.aiAnalysis?.confidence || 0,
        detected_fields: Object.keys(fieldMapping),
        total_processed: leads.length
      }
    });

    console.log(`🎉 [AI LEADS] Bulk import completed: ${results.created} created, ${results.failed} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      message: `AI-powered bulk import completed. ${results.created} leads imported successfully${results.failed > 0 ? `, ${results.failed} leads failed` : ''}.`,
      aiAnalysis: results.aiAnalysis
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ [AI LEADS] Bulk import error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error during bulk import",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}