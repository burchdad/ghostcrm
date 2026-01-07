# AI-Powered Leads Bulk Import System

## Overview

The **AI-Powered Leads Bulk Import System** intelligently processes CSV files containing lead data with advanced field mapping, data parsing, and validation. This system is designed to handle various CSV formats and column naming conventions automatically.

## Key Features

### 🤖 **AI Field Mapping**
- **Intelligent Column Detection**: Automatically detects and maps CSV columns to lead fields
- **Fuzzy Matching**: Handles variations in column names (e.g., "email", "e_mail", "email_address")
- **Confidence Scoring**: Provides confidence levels for field mappings
- **Smart Suggestions**: Offers suggestions for uncertain mappings

### 🧠 **AI Data Processing**
- **Name Parsing**: Intelligently splits full names into first/last names
- **Data Cleaning**: Removes extra spaces, validates formats
- **Email Validation**: Validates email addresses using regex patterns
- **Phone Formatting**: Standardizes phone number formats
- **URL Normalization**: Automatically adds https:// prefix to websites
- **Date Parsing**: Handles various date formats
- **Number Extraction**: Extracts numeric values from formatted strings

### 📊 **Comprehensive Field Support**

#### **Contact Information**
- `full_name`, `first_name`, `last_name`
- `email`, `phone`
- `company`, `job_title`, `website`

#### **Address Details**
- `address`, `city`, `state`, `zip_code`, `country`

#### **Lead Metadata**
- `source`, `lead_score`, `status`, `stage`
- `value`, `priority`, `probability`
- `campaign`, `referral_source`
- `expected_close_date`, `notes`, `tags`

## API Endpoint

### POST `/api/leads/bulk`

**Request Body:**
```json
{
  "leads": [
    {
      "Name": "John Doe",
      "Email Address": "john@company.com",
      "Phone": "(555) 123-4567",
      "Company": "ABC Corp",
      "Lead Source": "Website",
      "Deal Value": "$50,000",
      "Notes": "Interested in premium package"
    }
  ],
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "created": 8,
    "updated": 0,
    "failed": 2,
    "errors": ["Invalid email format for lead 3"],
    "processedLeads": [
      {
        "id": "lead-123",
        "name": "John Doe",
        "email": "john@company.com",
        "source": "Website"
      }
    ]
  },
  "message": "AI-powered bulk import completed. 8 leads imported successfully, 2 leads failed.",
  "aiAnalysis": {
    "detectedFields": {
      "full_name": "Name",
      "email": "Email Address",
      "phone": "Phone",
      "company": "Company",
      "source": "Lead Source",
      "value": "Deal Value",
      "notes": "Notes"
    },
    "confidence": 0.92,
    "suggestions": [
      "Field 'Phone' mapped to 'phone' (confidence: 85%)"
    ]
  }
}
```

## Field Mapping Intelligence

### **Supported Column Name Variations**

| Target Field | Recognized Variations |
|-------------|---------------------|
| **full_name** | name, full_name, fullname, contact_name, lead_name, customer_name, client_name |
| **email** | email, email_address, e_mail, contact_email, mail, email_id |
| **phone** | phone, phone_number, telephone, mobile, cell, contact_phone, tel, phone_no |
| **company** | company, organization, business, employer, corp, firm, business_name, org |
| **source** | source, lead_source, origin, channel, campaign_source, referrer |
| **value** | value, deal_value, potential_value, opportunity_value, revenue, amount |

### **AI Mapping Process**

1. **Exact Match** (100% confidence): Column name exactly matches expected field
2. **Partial Match** (80% confidence): Column name contains or is contained in expected field
3. **Fuzzy Match** (60% confidence): Levenshtein distance ≤ 2 characters
4. **Confidence Threshold**: Only mappings with >50% confidence are used

## Data Validation & Cleaning

### **Email Validation**
```javascript
// Validates email format using regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### **Phone Number Cleaning**
```javascript
// Extracts digits, requires minimum 10 digits
const phone = value.replace(/\D/g, ''); 
return phone.length >= 10 ? phone : undefined;
```

### **URL Normalization**
```javascript
// Automatically adds protocol if missing
if (url && !url.startsWith('http')) {
  url = 'https://' + url;
}
```

### **Number Extraction**
```javascript
// Removes currency symbols and formatting
const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
```

## Error Handling

### **Graceful Degradation**
- If AI processing fails, falls back to original data
- Continues processing remaining leads even if individual leads fail
- Provides detailed error messages for troubleshooting

### **Comprehensive Logging**
```javascript
console.log(`🤖 [AI LEADS BULK] Processing ${leads.length} leads with AI=${useAI}`);
console.log(`🧠 [AI LEADS] Performing AI field mapping analysis...`);
console.log(`🎯 [AI LEADS] Field mapping confidence: ${confidence}%`);
console.log(`✅ [AI LEADS] Successfully created lead: ${name} (ID: ${id})`);
```

## Integration with Existing System

### **Contact Management**
- Automatically creates or updates contact records
- Links leads to contacts via `contact_id`
- Handles duplicate detection via email/phone

### **Audit Trail**
- Logs all import activities in `audit_events` table
- Tracks AI processing details and field mappings
- Maintains import timestamp and metadata

### **Custom Fields**
```json
"custom_fields": {
  "campaign": "Q1 2026 Campaign",
  "referral_source": "Partner ABC",
  "ai_processed": true,
  "import_timestamp": "2026-01-07T15:30:00Z"
}
```

## Usage Examples

### **Basic CSV Import**
```csv
Name,Email,Phone,Company,Source
John Doe,john@email.com,555-1234,ACME Corp,Website
Jane Smith,jane@email.com,555-5678,XYZ Inc,Referral
```

### **Advanced CSV with Lead Scoring**
```csv
Contact Name,Email Address,Phone Number,Organization,Lead Score,Deal Value,Expected Close,Priority,Campaign
John Doe,john@email.com,(555) 123-4567,ACME Corp,85,$50000,2026-03-15,high,Q1 Campaign
Jane Smith,jane@email.com,555.567.8901,XYZ Inc,72,$25000,2026-02-28,medium,Partner Referral
```

## Performance & Scalability

- **Batch Processing**: Processes leads sequentially for data integrity
- **Memory Efficient**: Streams data without loading entire dataset
- **Error Recovery**: Continues processing despite individual failures
- **Progress Tracking**: Provides real-time feedback on import progress

## Security Features

- **Organization Isolation**: All data scoped to user's organization
- **Authentication Required**: JWT token validation on all requests
- **Data Sanitization**: Input cleaning prevents injection attacks
- **Audit Logging**: Complete trail of all import activities

---

**The AI-powered leads bulk import system provides enterprise-grade data processing capabilities while maintaining ease of use for various CSV formats and data quality scenarios.**