import { z } from "zod";
export const LeadCreate = z.object({
  // Basic Contact Info
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  
  // Lead Management
  stage: z.enum(["inquiry", "contacted", "qualified", "appointment_scheduled", "test_drive_completed", "negotiating", "financing", "closed_won", "closed_lost"]).optional(),
  source: z.enum(["website", "phone", "walk_in", "referral", "social_media", "advertising", "trade_show", "partner"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  
  // Auto Dealership Specific
  vehicle_interest: z.object({
    type: z.enum(["new", "used", "certified_pre_owned"]).optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().min(1990).max(new Date().getFullYear() + 2).optional(),
    trim: z.string().optional(),
    body_style: z.enum(["sedan", "suv", "truck", "coupe", "hatchback", "convertible", "wagon", "van"]).optional(),
    fuel_type: z.enum(["gasoline", "hybrid", "electric", "diesel"]).optional(),
    transmission: z.enum(["automatic", "manual", "cvt"]).optional(),
    budget_min: z.number().min(0).optional(),
    budget_max: z.number().min(0).optional(),
    financing_type: z.enum(["cash", "finance", "lease", "undecided"]).optional(),
    trade_in_vehicle: z.string().optional(),
  }).optional(),
  
  // Financing & Credit
  financing_info: z.object({
    credit_score_range: z.enum(["300-579", "580-669", "670-739", "740-799", "800-850", "unknown"]).optional(),
    annual_income: z.number().min(0).optional(),
    employment_status: z.enum(["employed", "self_employed", "retired", "unemployed", "student"]).optional(),
    down_payment_amount: z.number().min(0).optional(),
    monthly_payment_preference: z.number().min(0).optional(),
    pre_approved: z.boolean().optional(),
    bank_or_lender: z.string().optional(),
  }).optional(),
  
  // Lead Scoring Factors
  lead_score: z.number().min(0).max(100).optional(),
  urgency_level: z.enum(["immediate", "within_week", "within_month", "within_3_months", "just_browsing"]).optional(),
  
  // Campaign & Attribution
  campaign: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referral_source: z.string().optional(),
  
  // Timeline & Follow-up
  preferred_contact_time: z.enum(["morning", "afternoon", "evening", "weekday", "weekend"]).optional(),
  preferred_contact_method: z.enum(["phone", "email", "text", "in_person"]).optional(),
  follow_up_date: z.string().optional(),
  
  // Legacy fields for compatibility
  est_value: z.number().optional(),
  meta: z.record(z.any()).optional(),
});
export const DealCreate = z.object({
  // Basic Deal Info
  title: z.string().min(1),
  amount: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  close_date: z.string().optional(),
  pipeline: z.string().optional(),
  stage: z.enum(["prospect", "qualified", "proposal", "negotiation", "financing", "paperwork", "closed_won", "closed_lost"]).optional(),
  owner_id: z.string().uuid().optional(),
  lead_id: z.number().optional(),
  
  // Auto Dealership Specific
  vehicle_details: z.object({
    // Vehicle Information
    vin: z.string().optional(),
    year: z.number().min(1990).max(new Date().getFullYear() + 2).optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    trim: z.string().optional(),
    color_exterior: z.string().optional(),
    color_interior: z.string().optional(),
    mileage: z.number().min(0).optional(),
    condition: z.enum(["new", "used", "certified_pre_owned"]).optional(),
    
    // Pricing
    msrp: z.number().min(0).optional(),
    invoice_price: z.number().min(0).optional(),
    selling_price: z.number().min(0).optional(),
    discount_amount: z.number().optional(),
    rebates: z.number().optional(),
    
    // Features & Options
    features: z.array(z.string()).optional(),
    packages: z.array(z.string()).optional(),
    warranty_type: z.enum(["manufacturer", "extended", "third_party", "none"]).optional(),
    warranty_months: z.number().min(0).optional(),
  }).optional(),
  
  // Financing Details
  financing: z.object({
    type: z.enum(["cash", "finance", "lease"]).optional(),
    
    // Finance/Loan Details
    loan_amount: z.number().min(0).optional(),
    down_payment: z.number().min(0).optional(),
    apr: z.number().min(0).max(50).optional(),
    term_months: z.number().min(12).max(84).optional(),
    monthly_payment: z.number().min(0).optional(),
    lender: z.string().optional(),
    
    // Lease Details
    lease_term_months: z.number().min(12).max(60).optional(),
    lease_payment: z.number().min(0).optional(),
    lease_miles_per_year: z.number().min(5000).max(25000).optional(),
    residual_value: z.number().min(0).optional(),
    
    // Credit Information
    credit_score: z.number().min(300).max(850).optional(),
    credit_tier: z.enum(["super_prime", "prime", "near_prime", "subprime", "deep_subprime"]).optional(),
    debt_to_income: z.number().min(0).max(100).optional(),
  }).optional(),
  
  // Trade-In Information
  trade_in: z.object({
    has_trade: z.boolean().optional(),
    trade_vin: z.string().optional(),
    trade_year: z.number().min(1990).max(new Date().getFullYear()).optional(),
    trade_make: z.string().optional(),
    trade_model: z.string().optional(),
    trade_mileage: z.number().min(0).optional(),
    trade_condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
    trade_value_estimate: z.number().min(0).optional(),
    trade_payoff_amount: z.number().optional(),
    trade_equity: z.number().optional(),
  }).optional(),
  
  // Negotiation & Process
  negotiation: z.object({
    customer_budget: z.number().min(0).optional(),
    initial_offer: z.number().min(0).optional(),
    counter_offers: z.array(z.object({
      amount: z.number(),
      date: z.string(),
      notes: z.string().optional()
    })).optional(),
    final_price: z.number().min(0).optional(),
    
    // Sales Process
    test_drive_completed: z.boolean().optional(),
    test_drive_date: z.string().optional(),
    home_delivery: z.boolean().optional(),
    delivery_date: z.string().optional(),
    
    // Documentation
    credit_application_submitted: z.boolean().optional(),
    insurance_verified: z.boolean().optional(),
    documents_signed: z.boolean().optional(),
    keys_delivered: z.boolean().optional(),
  }).optional(),
  
  // Financial Calculations
  tax_title_fees: z.object({
    sales_tax_rate: z.number().min(0).max(15).optional(),
    sales_tax_amount: z.number().min(0).optional(),
    title_fee: z.number().min(0).optional(),
    registration_fee: z.number().min(0).optional(),
    documentation_fee: z.number().min(0).optional(),
    dealer_prep_fee: z.number().min(0).optional(),
    extended_warranty_cost: z.number().min(0).optional(),
    gap_insurance_cost: z.number().min(0).optional(),
    total_fees: z.number().min(0).optional(),
  }).optional(),
  
  // Delivery & Service
  delivery: z.object({
    delivery_method: z.enum(["pickup", "home_delivery", "mail_delivery"]).optional(),
    delivery_address: z.string().optional(),
    delivery_date: z.string().optional(),
    delivery_time: z.string().optional(),
    special_instructions: z.string().optional(),
  }).optional(),
  
  // Additional Services
  services: z.object({
    maintenance_plan: z.boolean().optional(),
    service_contract: z.boolean().optional(),
    roadside_assistance: z.boolean().optional(),
    paint_protection: z.boolean().optional(),
    interior_protection: z.boolean().optional(),
    tint_windows: z.boolean().optional(),
    accessories: z.array(z.string()).optional(),
  }).optional(),
  
  // Customer Information
  customer_info: z.object({
    primary_buyer: z.string().optional(),
    co_buyer: z.string().optional(),
    contact_method: z.enum(["phone", "email", "text", "in_person"]).optional(),
    preferred_communication: z.enum(["morning", "afternoon", "evening", "weekend"]).optional(),
    referral_source: z.string().optional(),
    previous_customer: z.boolean().optional(),
    loyalty_member: z.boolean().optional(),
  }).optional(),
  
  // Deal Metrics & Notes
  deal_metrics: z.object({
    profit_margin: z.number().optional(),
    commission_amount: z.number().optional(),
    days_in_pipeline: z.number().min(0).optional(),
    follow_up_count: z.number().min(0).optional(),
    competitive_quotes: z.number().min(0).optional(),
  }).optional(),
  
  // Notes and Comments
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  
  // Legacy compatibility
  meta: z.record(z.any()).optional(),
});
// Enhanced appointment schema for auto dealership
export const ApptCreate = z.object({
  title: z.string().min(1),
  type: z.enum([
    "test_drive", 
    "sales_consultation", 
    "financing_meeting", 
    "service_appointment", 
    "vehicle_delivery", 
    "trade_in_appraisal", 
    "follow_up_call", 
    "virtual_tour",
    "paperwork_signing"
  ]).default("sales_consultation"),
  location: z.string().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  duration_minutes: z.number().min(15).max(480).default(60),
  
  // Participant information
  lead_id: z.number().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional(),
  sales_rep_id: z.string().uuid().optional(),
  
  // Auto dealership specific fields
  vehicle_of_interest: z.object({
    vin: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    stock_number: z.string().optional(),
    price: z.number().optional()
  }).optional(),
  
  // Appointment details
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum([
    "scheduled", 
    "confirmed", 
    "in_progress", 
    "completed", 
    "cancelled", 
    "no_show", 
    "rescheduled"
  ]).default("scheduled"),
  
  // Preparation and notes
  preparation_notes: z.string().optional(),
  customer_requirements: z.string().optional(),
  internal_notes: z.string().optional(),
  
  // Reminders and follow-up
  send_reminder: z.boolean().default(true),
  reminder_intervals: z.array(z.enum(["24h", "4h", "1h", "15m"])).default(["24h", "1h"]),
  follow_up_required: z.boolean().default(false),
  
  // Integration flags
  sync_to_calendar: z.boolean().default(true),
  create_deal_if_missing: z.boolean().default(false)
});

export type ApptCreateType = z.infer<typeof ApptCreate>;
export const MessageSend = z.object({
  channel: z.enum(["sms","email"]),
  to: z.string().min(3),
  from: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  lead_id: z.number().optional(),
});

// AI Lead scoring schemas
export const LeadScore = z.object({
  lead_id: z.string(),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  factors: z.record(z.number()),
  risk_factors: z.array(z.string()),
  opportunity_indicators: z.array(z.string()),
  last_updated: z.string()
});

export const AIScoreRequest = z.object({
  lead_ids: z.array(z.string()).optional(),
  include_recommendations: z.boolean().default(true),
  use_ai_analysis: z.boolean().default(false),
  batch_size: z.number().min(1).max(100).default(50)
});

export type LeadScoreType = z.infer<typeof LeadScore>;
export type AIScoreRequestType = z.infer<typeof AIScoreRequest>;
