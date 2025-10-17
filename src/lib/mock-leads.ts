// Shared mock lead data for demo mode
let mockLeads = [
  {
    id: "1",
    "Full Name": "John Miller",
    "Email Address": "john.miller@email.com",
    "Phone Number": "(555) 123-4567",
    "Company": "Miller Enterprises",
    stage: "qualified",
    source: "website",
    priority: "high",
    lead_score: 85,
    opted_out: false,
    vehicle_interest: {
      type: "new",
      make: "Toyota",
      model: "Camry",
      year: 2024,
      budget_max: 35000,
      financing_type: "finance"
    },
    financing_info: {
      credit_score_range: "740-799",
      monthly_payment_preference: 450
    },
    urgency_level: "within_week",
    "Created Date": new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    "Full Name": "Sarah Johnson",
    "Email Address": "sarah.j@email.com", 
    "Phone Number": "(555) 987-6543",
    "Company": "Johnson Auto Group",
    stage: "appointment_scheduled",
    source: "referral",
    priority: "urgent",
    lead_score: 92,
    opted_out: false,
    vehicle_interest: {
      type: "certified_pre_owned",
      make: "Honda",
      model: "CR-V",
      year: 2023,
      budget_max: 28000,
      financing_type: "cash"
    },
    urgency_level: "immediate",
    "Created Date": new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    "Full Name": "Michael Chen",
    "Email Address": "m.chen@example.com",
    "Phone Number": "(555) 456-7890",
    "Company": "Chen Holdings",
    stage: "contacted",
    source: "facebook",
    priority: "medium",
    lead_score: 78,
    opted_out: false,
    vehicle_interest: {
      type: "new",
      make: "Ford",
      model: "F-150",
      year: 2024,
      budget_max: 45000,
      financing_type: "lease"
    },
    urgency_level: "within_month",
    "Created Date": new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    "Full Name": "Lisa Rodriguez",
    "Email Address": "lisa.rodriguez@work.com",
    "Phone Number": "(555) 321-0987",
    "Company": "Rodriguez & Associates",
    stage: "qualified",
    source: "google_ads",
    priority: "high",
    lead_score: 88,
    opted_out: false,
    vehicle_interest: {
      type: "certified_pre_owned",
      make: "BMW",
      model: "X3",
      year: 2023,
      budget_max: 38000,
      financing_type: "finance"
    },
    urgency_level: "within_week",
    "Created Date": new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "5",
    "Full Name": "David Wilson",
    "Email Address": "d.wilson@email.net",
    "Phone Number": "(555) 654-3210",
    "Company": "Wilson Construction",
    stage: "test_drive_completed",
    source: "dealership_visit",
    priority: "urgent",
    lead_score: 95,
    opted_out: false,
    vehicle_interest: {
      type: "new",
      make: "Chevrolet",
      model: "Silverado",
      year: 2024,
      budget_max: 52000,
      financing_type: "finance"
    },
    urgency_level: "immediate",
    "Created Date": new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "6",
    "Full Name": "Jennifer Thompson",
    "Email Address": "j.thompson@business.com",
    "Phone Number": "(555) 789-1234",
    "Company": "",
    stage: "inquiry",
    source: "website",
    priority: "low",
    lead_score: 62,
    opted_out: true,
    vehicle_interest: {
      type: "new",
      make: "Nissan",
      model: "Altima",
      year: 2024,
      budget_max: 25000,
      financing_type: "finance"
    },
    urgency_level: "researching",
    "Created Date": new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function getMockLeads() {
  return mockLeads;
}

export function updateLeadOptOut(leadId: string, optedOut: boolean): boolean {
  const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
  if (leadIndex !== -1) {
    mockLeads[leadIndex].opted_out = optedOut;
    mockLeads[leadIndex].updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

export function findLeadById(leadId: string) {
  return mockLeads.find(lead => lead.id === leadId);
}