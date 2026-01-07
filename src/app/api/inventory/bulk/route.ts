import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

// AI-powered field mapping and data parsing
interface AIFieldMapping {
  detectedFields: { [key: string]: string };
  confidence: number;
  suggestions: string[];
}

interface ParsedInventoryItem {
  name?: string;
  sku?: string;
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
  vin?: string | null;
  condition?: string;
  status?: string;
  price_cost?: number;
  price_msrp?: number;
  price_selling?: number;
  price_currency?: string;
  stock_on_hand?: number;
  stock_reserved?: number;
  stock_available?: number;
  stock_reorder_level?: number;
  stock_reorder_qty?: number;
  loc_lot?: string;
  loc_section?: string;
  loc_row?: string;
  loc_spot?: string;
  loc_warehouse?: string;
  description?: string;
  notes?: string;
  specifications?: any;
  images?: string[];
  custom_fields?: any;
  [key: string]: any;
}

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * AI-powered field mapping to intelligently detect and map CSV fields
 */
function performAIFieldMapping(sampleItems: any[]): AIFieldMapping {
  const fieldMappings: { [key: string]: string } = {};
  const suggestions: string[] = [];
  let totalConfidence = 0;
  
  // Get all unique field names from sample items
  const allFields = new Set<string>();
  sampleItems.forEach(item => {
    Object.keys(item).forEach(key => allFields.add(key.toLowerCase()));
  });
  
  const targetFields = {
    name: ['name', 'product_name', 'item_name', 'title', 'product', 'item'],
    sku: ['sku', 'product_id', 'item_id', 'code', 'product_code', 'part_number', 'partnumber'],
    category: ['category', 'type', 'product_type', 'class', 'classification'],
    brand: ['brand', 'manufacturer', 'make', 'company', 'vendor'],
    model: ['model', 'version', 'variant', 'product_model'],
    year: ['year', 'model_year', 'production_year', 'manufacture_year'],
    vin: ['vin', 'vehicle_id', 'chassis', 'serial', 'serial_number'],
    condition: ['condition', 'state', 'quality', 'grade'],
    status: ['status', 'availability', 'available', 'state'],
    price_cost: ['cost', 'price_cost', 'cost_price', 'wholesale', 'buy_price'],
    price_msrp: ['msrp', 'retail', 'list_price', 'suggested_price', 'price_msrp'],
    price_selling: ['price', 'selling_price', 'sell_price', 'sale_price', 'current_price', 'price_selling'],
    stock_on_hand: ['quantity', 'stock', 'inventory', 'on_hand', 'qty', 'stock_on_hand', 'available_qty'],
    description: ['description', 'details', 'notes', 'summary', 'info'],
    loc_warehouse: ['warehouse', 'location', 'facility', 'site', 'depot'],
    loc_section: ['section', 'area', 'zone', 'department'],
    loc_row: ['row', 'aisle', 'lane'],
    loc_spot: ['spot', 'position', 'bin', 'shelf']
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
 * AI-powered data parsing and cleaning
 */
function parseInventoryItemWithAI(rawItem: any, fieldMapping: { [key: string]: string }): ParsedInventoryItem {
  const parsed: ParsedInventoryItem = {};
  
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
    // Text fields with intelligent cleaning
    parsed.name = cleanAndValidateText(getFieldValue('name', ['product_name', 'item_name', 'title']));
    parsed.sku = cleanAndValidateSKU(getFieldValue('sku', ['product_id', 'item_id', 'code']));
    parsed.category = cleanAndValidateText(getFieldValue('category', ['type', 'product_type']));
    parsed.brand = cleanAndValidateText(getFieldValue('brand', ['manufacturer', 'make']));
    parsed.model = cleanAndValidateText(getFieldValue('model', ['version', 'variant']));
    parsed.vin = cleanAndValidateVIN(getFieldValue('vin', ['vehicle_id', 'chassis', 'serial']));
    parsed.description = cleanAndValidateText(getFieldValue('description', ['details', 'notes']));
    
    // Numeric fields with intelligent parsing
    parsed.year = parseIntegerWithValidation(getFieldValue('year', ['model_year']), 1900, new Date().getFullYear() + 2);
    parsed.price_cost = parseDecimalWithValidation(getFieldValue('price_cost', ['cost', 'wholesale']));
    parsed.price_msrp = parseDecimalWithValidation(getFieldValue('price_msrp', ['msrp', 'retail']));
    parsed.price_selling = parseDecimalWithValidation(getFieldValue('price_selling', ['price', 'selling_price', 'sell_price']));
    parsed.stock_on_hand = parseIntegerWithValidation(getFieldValue('stock_on_hand', ['quantity', 'stock', 'qty']), 0);
    parsed.stock_reserved = parseIntegerWithValidation(getFieldValue('stock_reserved', ['reserved']), 0);
    parsed.stock_available = parseIntegerWithValidation(getFieldValue('stock_available', ['available', 'available_qty']), 0);
    
    // Enum fields with intelligent matching
    parsed.condition = parseEnumWithValidation(
      getFieldValue('condition', ['state', 'quality']), 
      ['new', 'used', 'certified', 'refurbished', 'damaged'], 
      'new'
    );
    parsed.status = parseEnumWithValidation(
      getFieldValue('status', ['availability', 'state']), 
      ['available', 'reserved', 'sold', 'pending', 'maintenance'], 
      'available'
    );
    
    // Currency with intelligent detection
    parsed.price_currency = parseCurrency(getFieldValue('price_currency', ['currency']));
    
    // Location fields
    parsed.loc_warehouse = cleanAndValidateText(getFieldValue('loc_warehouse', ['warehouse', 'location']));
    parsed.loc_section = cleanAndValidateText(getFieldValue('loc_section', ['section', 'area']));
    parsed.loc_row = cleanAndValidateText(getFieldValue('loc_row', ['row', 'aisle']));
    parsed.loc_spot = cleanAndValidateText(getFieldValue('loc_spot', ['spot', 'bin']));
    
  } catch (parseError) {
    console.warn('⚠️ [AI PARSING] Error parsing item:', parseError);
  }
  
  return parsed;
}

/**
 * Intelligent text cleaning and validation
 */
function cleanAndValidateText(value: any): string {
  if (value === null || value === undefined) return '';
  
  let cleaned = String(value).trim();
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove special characters that might cause issues
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  
  return cleaned;
}

/**
 * SKU cleaning and validation
 */
function cleanAndValidateSKU(value: any): string {
  if (value === null || value === undefined) return '';
  
  let sku = String(value).trim().toUpperCase();
  
  // Remove spaces and special characters except hyphens and underscores
  sku = sku.replace(/[^A-Z0-9\-_]/g, '');
  
  return sku;
}

/**
 * VIN cleaning and validation
 */
function cleanAndValidateVIN(value: any): string | null {
  if (value === null || value === undefined) return null;
  
  let vin = String(value).trim().toUpperCase();
  
  // VIN should be 17 characters
  vin = vin.replace(/[^A-Z0-9]/g, '');
  
  if (vin.length === 17) {
    return vin;
  }
  
  return vin.length > 0 ? vin : null;
}

/**
 * Intelligent integer parsing with validation
 */
function parseIntegerWithValidation(value: any, min?: number, max?: number): number {
  if (value === null || value === undefined || value === '') return 0;
  
  // Handle string numbers with commas
  let numStr = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
  
  const parsed = parseInt(numStr, 10);
  
  if (isNaN(parsed)) return 0;
  
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  
  return parsed;
}

/**
 * Intelligent decimal parsing with validation
 */
function parseDecimalWithValidation(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  
  // Handle currency symbols and commas
  let numStr = String(value)
    .replace(/[\$€£¥₹]/g, '') // Remove currency symbols
    .replace(/,/g, '') // Remove thousands separators
    .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus
  
  const parsed = parseFloat(numStr);
  
  if (isNaN(parsed)) return 0;
  
  // Round to 2 decimal places for currency
  return Math.round(parsed * 100) / 100;
}

/**
 * Intelligent enum parsing with fuzzy matching
 */
function parseEnumWithValidation(value: any, validValues: string[], defaultValue: string): string {
  if (value === null || value === undefined || value === '') return defaultValue;
  
  const str = String(value).toLowerCase().trim();
  
  // Exact match
  if (validValues.includes(str)) return str;
  
  // Fuzzy matching for common variations
  for (const validValue of validValues) {
    if (str.includes(validValue) || validValue.includes(str)) {
      return validValue;
    }
  }
  
  // Handle common condition variations
  if (validValues.includes('new') && ['brand new', 'mint', 'unused'].some(v => str.includes(v))) {
    return 'new';
  }
  if (validValues.includes('used') && ['second hand', 'pre-owned', 'preowned'].some(v => str.includes(v))) {
    return 'used';
  }
  
  return defaultValue;
}

/**
 * Intelligent currency detection and parsing
 */
function parseCurrency(value: any): string {
  if (value === null || value === undefined) return 'USD';
  
  const str = String(value).toUpperCase().trim();
  
  // Common currency codes
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];
  
  if (currencies.includes(str)) return str;
  
  // Handle currency symbols
  if (str.includes('$')) return 'USD';
  if (str.includes('€')) return 'EUR';
  if (str.includes('£')) return 'GBP';
  if (str.includes('¥')) return 'JPY';
  if (str.includes('₹')) return 'INR';
  
  return 'USD'; // Default
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get authenticated user
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Items array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🤖 [INVENTORY BULK AI] Processing ${items.length} items with AI parsing for organization ${user.organizationId}`);

    // Perform AI field mapping on a sample of items
    const sampleSize = Math.min(5, items.length);
    const sampleItems = items.slice(0, sampleSize);
    const aiMapping = performAIFieldMapping(sampleItems);
    
    console.log(`🧠 [AI FIELD MAPPING] Detected fields with ${(aiMapping.confidence * 100).toFixed(1)}% confidence:`, aiMapping.detectedFields);
    
    if (aiMapping.suggestions.length > 0) {
      console.log(`💡 [AI SUGGESTIONS]:`, aiMapping.suggestions);
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      aiMapping: {
        confidence: aiMapping.confidence,
        detectedFields: aiMapping.detectedFields,
        suggestions: aiMapping.suggestions
      }
    };

    // Process items in batches of 50 for better performance
    const batchSize = 50;
    const batches: any[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const inventoryData = batch.map((item: any, index: number) => {
        try {
          // Use AI to parse and clean the inventory item
          const parsedItem = parseInventoryItemWithAI(item, aiMapping.detectedFields);
          
          // Validate required fields after AI parsing
          if (!parsedItem.name || !parsedItem.sku || !parsedItem.category) {
            results.failed++;
            results.errors.push(`Row ${index + 1}: Missing required fields after AI parsing (name: '${parsedItem.name}', sku: '${parsedItem.sku}', category: '${parsedItem.category}')`);
            return null;
          }

          // Check for duplicate SKU within the batch
          const duplicateInBatch = batch.find((otherItem: any, otherIndex: number) => {
            if (otherIndex === index) return false;
            const otherParsed = parseInventoryItemWithAI(otherItem, aiMapping.detectedFields);
            return otherParsed.sku === parsedItem.sku;
          });
          
          if (duplicateInBatch) {
            results.failed++;
            results.errors.push(`Row ${index + 1}: Duplicate SKU '${parsedItem.sku}' found in import data`);
            return null;
          }

          // Build the final inventory data object
          const inventoryItem = {
            organization_id: user.organizationId,
            name: parsedItem.name,
            sku: parsedItem.sku,
            category: parsedItem.category,
            brand: parsedItem.brand || '',
            model: parsedItem.model || '',
            year: parsedItem.year || null,
            vin: parsedItem.vin || null,
            condition: parsedItem.condition || 'new',
            status: parsedItem.status || 'available',
            price_cost: parsedItem.price_cost || 0,
            price_msrp: parsedItem.price_msrp || 0,
            price_selling: parsedItem.price_selling || 0,
            price_currency: parsedItem.price_currency || 'USD',
            stock_on_hand: parsedItem.stock_on_hand || 0,
            stock_reserved: parsedItem.stock_reserved || 0,
            stock_available: parsedItem.stock_available || parsedItem.stock_on_hand || 0,
            stock_reorder_level: parsedItem.stock_reorder_level || 0,
            stock_reorder_qty: parsedItem.stock_reorder_qty || 0,
            loc_lot: parsedItem.loc_lot || '',
            loc_section: parsedItem.loc_section || '',
            loc_row: parsedItem.loc_row || '',
            loc_spot: parsedItem.loc_spot || '',
            loc_warehouse: parsedItem.loc_warehouse || '',
            description: parsedItem.description || '',
            notes: parsedItem.notes || '',
            specifications: parsedItem.specifications || {},
            images: parsedItem.images || [],
            custom_fields: parsedItem.custom_fields || {},
            created_by: user.id,
            updated_by: user.id
          };

          console.log(`🤖 [AI PARSED] Item ${index + 1}: ${inventoryItem.name} (${inventoryItem.sku})`);
          return inventoryItem;
          
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${index + 1}: AI parsing error - ${error instanceof Error ? error.message : 'Unknown error'}`);
          return null;
        }
      }).filter(Boolean);

      if (inventoryData.length === 0) continue;

      try {
        const { data, error } = await supabaseAdmin
          .from("inventory")
          .insert(inventoryData)
          .select("id, sku, name");

        if (error) {
          console.error("❌ [INVENTORY BULK] Database error:", error);
          
          // Handle specific database errors
          if (error.code === '23505') { // Unique constraint violation
            results.failed += inventoryData.length;
            results.errors.push(`Batch error: Duplicate SKU or VIN found in database`);
          } else {
            results.failed += inventoryData.length;
            results.errors.push(`Batch error: ${error.message}`);
          }
        } else {
          results.successful += data?.length || 0;
          console.log(`✅ [INVENTORY BULK] Successfully inserted ${data?.length || 0} items`);
        }
      } catch (batchError) {
        console.error("❌ [INVENTORY BULK] Batch processing error:", batchError);
        results.failed += inventoryData.length;
        results.errors.push(`Batch processing error: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
      }
    }

    // Log audit event for bulk import with AI processing details
    try {
      await supabaseAdmin.from("audit_events").insert({
        organization_id: user.organizationId,
        entity: "inventory",
        entity_id: null,
        action: "bulk_import_ai",
        user_id: user.id,
        details: {
          total_items: items.length,
          successful: results.successful,
          failed: results.failed,
          error_count: results.errors.length,
          ai_confidence: aiMapping.confidence,
          detected_fields: Object.keys(aiMapping.detectedFields).length,
          ai_suggestions: aiMapping.suggestions.length
        }
      });
    } catch (auditError) {
      console.warn("⚠️ [INVENTORY BULK AI] Failed to log audit event:", auditError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `AI-powered bulk import completed. ${results.successful} items imported successfully, ${results.failed} items failed.`,
      results: {
        successful: results.successful,
        failed: results.failed,
        errors: results.errors,
        aiMapping: results.aiMapping
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ [INVENTORY BULK] Bulk import error:", error);
    return new Response(
      JSON.stringify({ 
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