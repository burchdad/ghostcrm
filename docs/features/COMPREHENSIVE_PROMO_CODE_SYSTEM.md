# 🎫 Comprehensive Promo Code System for GhostCRM

## Overview

This document outlines the proper way to handle promo codes in your GhostCRM system, ensuring they work across the entire software layout and integrate seamlessly with Stripe.

## ❌ The Problem (What You Had Before)

Your previous promo code system had several limitations:

1. **Database-Only Validation**: Promo codes were only validated in your app, not in Stripe
2. **Manual Price Calculation**: Frontend calculated discounts manually, Stripe didn't know about them
3. **Limited Scope**: Only worked in billing page, not across entire Stripe ecosystem
4. **No Real Integration**: Promo codes weren't created as Stripe coupons/promotion codes

## ✅ The Solution (What We Built)

### 1. **Proper Stripe Integration**

Promo codes are now synchronized with Stripe as proper coupons and promotion codes:

```typescript
// Before: Manual frontend calculation
const discountedPrice = originalPrice * (1 - discountPercent / 100)

// After: Stripe handles everything automatically
sessionParams.discounts = [{
  promotion_code: stripePromotionCodeId  // Stripe applies discount
}]
```

### 2. **Database Schema Enhancement**

Updated `promo_codes` table with Stripe sync fields:

```sql
ALTER TABLE promo_codes 
ADD COLUMN stripe_coupon_id VARCHAR(255) UNIQUE,
ADD COLUMN stripe_promotion_code_id VARCHAR(255) UNIQUE,
ADD COLUMN synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_status VARCHAR(50) DEFAULT 'pending';
```

### 3. **Automatic Sync System**

```typescript
// API: /api/promo-codes/sync-stripe
// Automatically creates Stripe coupons and promotion codes
// Handles all discount types: percentage, fixed, custom_price
```

## 🚀 How It Works Now

### **Step 1: Create Promo Code**

```bash
# Using management script
node scripts/manage-promo-codes.js create "TESTCLIENT70" "Special pricing for test client" custom_price 0 70 840

# Or via API
POST /api/owner/promo-codes
{
  "code": "TESTCLIENT70",
  "description": "Special pricing for test client - $70/month",
  "discountType": "custom_price",
  "customMonthlyPrice": 70.00,
  "customYearlyPrice": 840.00,
  "autoSyncStripe": true
}
```

### **Step 2: Automatic Stripe Sync**

The system automatically:
1. Creates a Stripe coupon with proper discount configuration
2. Creates a Stripe promotion code that customers can enter
3. Updates database with Stripe IDs
4. Marks sync status as 'synced'

### **Step 3: Customer Usage**

When customers enter promo codes:
1. **Validation**: Code validated against database AND Stripe
2. **Application**: Stripe promotion code applied directly to checkout session
3. **Tracking**: Usage tracked in `promo_code_usage` table
4. **Analytics**: Real-time usage analytics and reporting

## 📊 Features You Now Have

### **1. Global Promo Code Coverage**

✅ **Works everywhere Stripe is used**:
- Main billing page
- Stripe Customer Portal
- Mobile app billing (if you build one)
- Any Stripe-powered checkout

✅ **All discount types supported**:
- **Percentage**: `50% off for 6 months`
- **Fixed Amount**: `$25 off setup fee`
- **Custom Pricing**: `$70/month instead of $199/month`

### **2. Real-Time Analytics**

```typescript
// Get comprehensive analytics
const analytics = await getPromoCodeAnalytics()
// Returns: usage patterns, customer savings, popular codes, conversion rates
```

### **3. Proper Usage Tracking**

Every promo code usage is tracked with:
- Customer email
- Original amount vs final amount
- Plan selected
- Timestamp and metadata
- Automatic usage count increment

### **4. Management Tools**

```bash
# Check status of all promo codes
node scripts/manage-promo-codes.js status

# See usage analytics
node scripts/manage-promo-codes.js analytics

# Sync all codes with Stripe
node scripts/manage-promo-codes.js sync-all
```

## 🎯 Proper Implementation for Your Test Client

### **For TESTCLIENT70 Promo Code:**

1. **Create the code** (if not already created):
```sql
INSERT INTO promo_codes (
    code, description, discount_type, custom_monthly_price, custom_yearly_price,
    max_uses, expires_at, target_customer, is_active
) VALUES (
    'TESTCLIENT70',
    'Special pricing for test client - $70/month',
    'custom_price',
    70.00,
    840.00,
    1,
    NOW() + INTERVAL '1 year',
    'Test Client Company',
    true
);
```

2. **Sync with Stripe**:
```bash
node scripts/manage-promo-codes.js sync-all
```

3. **Verify it works**:
   - Customer enters `TESTCLIENT70` in billing page
   - System validates code exists and is active
   - Stripe promotion code applied to checkout
   - Customer pays $70/month instead of regular price
   - Usage tracked automatically

## 🔧 API Endpoints

### **Customer-Facing**
- `POST /api/billing/validate-promo` - Validate promo code
- `POST /api/billing/create-checkout` - Create checkout with promo applied

### **Owner-Facing**
- `GET /api/owner/promo-codes` - List all promo codes with analytics
- `POST /api/owner/promo-codes` - Create new promo code
- `PUT /api/owner/promo-codes` - Update promo code
- `DELETE /api/owner/promo-codes` - Deactivate promo code

### **System**
- `POST /api/promo-codes/sync-stripe` - Sync code with Stripe
- `PUT /api/promo-codes/sync-stripe` - Bulk sync all codes

## 🛡️ Security & Validation

### **Multi-Layer Validation**
1. **Database validation** - Code exists, active, not expired, under usage limit
2. **Stripe validation** - Promotion code exists and valid in Stripe
3. **Checkout validation** - Re-validated during checkout session creation

### **Usage Limits**
- Maximum usage counts enforced
- Expiration dates respected
- Customer-specific targeting (optional)

### **Audit Trail**
- Every usage logged with customer details
- Usage analytics for business insights
- Error tracking for failed applications

## 📈 Business Benefits

### **For You (Software Owner)**
- **Complete Control**: Create, modify, disable codes instantly
- **Real Analytics**: See which codes work, customer savings, conversion rates
- **Reduced Support**: Customers can't claim "promo code didn't work"
- **Stripe Integration**: Works with all Stripe features (invoices, customer portal, etc.)

### **For Your Customers**
- **Consistent Experience**: Promo codes work everywhere
- **Automatic Application**: No manual calculations or errors
- **Transparent Billing**: Clear discount shown in Stripe invoices
- **Customer Portal**: Discounts visible in Stripe customer portal

## 🚀 Next Steps

1. **Run the migration** to add Stripe sync fields:
```bash
psql -h your-db-host -d your-db < migrations/012_promo_codes_stripe_sync.sql
```

2. **Sync existing promo codes**:
```bash
node scripts/manage-promo-codes.js sync-all
```

3. **Test with your TESTCLIENT70 code**:
   - Go to `/billing`
   - Enter `TESTCLIENT70`
   - Verify it shows $70/month pricing
   - Complete checkout and verify Stripe invoice

4. **Monitor analytics**:
```bash
node scripts/manage-promo-codes.js analytics
```

## ⚠️ Important Notes

- **Always sync new codes** with Stripe for them to work in checkout
- **Test promo codes** in Stripe test mode before going live
- **Monitor usage limits** to prevent abuse
- **Set expiration dates** for time-limited promotions

This system ensures your promo codes work across your entire software ecosystem, not just a small portion, and provides the professional Stripe integration your customers expect.