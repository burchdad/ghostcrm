# AI-Powered Inventory Bulk Import

## 🧠 Overview

The inventory bulk import system now includes **advanced AI-powered field mapping and data parsing** that intelligently handles various CSV formats, column names, and data quality issues.

## ✨ AI Features

### 1. **Intelligent Field Mapping**
The AI automatically detects and maps CSV columns to inventory fields using:

- **Exact Matching**: Direct field name matches
- **Fuzzy Matching**: Handles variations and typos (max 2 character difference)
- **Contextual Analysis**: Understands field relationships and common variations
- **Confidence Scoring**: Provides confidence levels for each mapping

#### Supported Field Variations

| Target Field | AI Recognizes |
|-------------|---------------|
| `name` | product_name, item_name, title, product, item |
| `sku` | product_id, item_id, code, product_code, part_number |
| `category` | type, product_type, class, classification |
| `brand` | manufacturer, make, company, vendor |
| `price_selling` | price, selling_price, sell_price, sale_price, current_price |
| `price_cost` | cost, cost_price, wholesale, buy_price |
| `stock_on_hand` | quantity, stock, inventory, on_hand, qty, available_qty |
| `condition` | state, quality, grade |
| `warehouse` | location, facility, site, depot |

### 2. **Smart Data Parsing**

#### Text Cleaning
- Removes extra whitespace and control characters
- Normalizes text formatting
- Handles encoding issues

#### SKU Normalization
- Converts to uppercase
- Removes invalid characters
- Preserves hyphens and underscores

#### VIN Validation
- Validates 17-character VINs
- Removes invalid characters
- Handles partial VINs

#### Intelligent Number Parsing
```typescript
// Handles various number formats
"$1,234.56" → 1234.56
"€1.234,56" → 1234.56  
"1,234 units" → 1234
"2.5k" → 2500
```

#### Currency Detection
- Recognizes currency symbols ($, €, £, ¥, ₹)
- Maps to ISO currency codes
- Defaults to USD if uncertain

#### Smart Enum Matching
```typescript
// Condition variations
"Brand New" → "new"
"Pre-owned" → "used"
"Second Hand" → "used"
"Mint Condition" → "new"

// Status variations  
"In Stock" → "available"
"Out of Stock" → "sold"
"Back Order" → "pending"
```

### 3. **Data Quality Enhancement**

#### Validation Rules
- **Required Fields**: Ensures name, SKU, and category are present
- **Data Types**: Validates numbers, dates, and enums
- **Range Checking**: Year validation (1900-current+2)
- **Duplicate Detection**: Prevents duplicate SKUs within import

#### Error Handling
- **Detailed Feedback**: Specific error messages for each row
- **Partial Success**: Imports valid items even if some fail
- **Confidence Reporting**: Shows AI mapping confidence levels

## 🚀 Usage Examples

### Example 1: Standard CSV
```csv
Product Name,SKU,Category,Price,Quantity
"Laptop Computer","LAP001","Electronics",999.99,5
"Wireless Mouse","MOU001","Electronics",29.99,25
```

**AI Result**: 100% confidence mapping
- Product Name → name
- SKU → sku  
- Category → category
- Price → price_selling
- Quantity → stock_on_hand

### Example 2: Non-Standard CSV
```csv
Item Description,Part Number,Type,Cost ($),Wholesale Price,Retail,Units,Location
"Gaming Laptop","GAME-LAP-001","Computer","$800.00","$950.00","$1299.99","3","Warehouse A"
```

**AI Result**: 95% confidence mapping
- Item Description → name
- Part Number → sku
- Type → category
- Cost ($) → price_cost
- Retail → price_selling  
- Units → stock_on_hand
- Location → loc_warehouse

### Example 3: International Format
```csv
Nom du produit,Code article,Catégorie,Prix de vente,Quantité en stock
"Ordinateur portable","ORD001","Électronique","1.234,56 €","5"
```

**AI Result**: 85% confidence mapping with suggestions
- Nom du produit → name (fuzzy match)
- Code article → sku (fuzzy match)
- Prix de vente → price_selling + currency detection (EUR)

## 📊 AI Response Format

```typescript
{
  "success": true,
  "message": "AI-powered bulk import completed. 8 items imported successfully, 2 items failed.",
  "results": {
    "successful": 8,
    "failed": 2,
    "errors": [
      "Row 3: Missing required fields after AI parsing (name: '', sku: 'SKU003', category: 'Electronics')",
      "Row 7: Duplicate SKU 'DUP001' found in import data"
    ],
    "aiMapping": {
      "confidence": 0.92,
      "detectedFields": {
        "name": "product_name",
        "sku": "item_code", 
        "category": "product_type",
        "price_selling": "retail_price",
        "stock_on_hand": "qty_available"
      },
      "suggestions": [
        "Field 'item_code' mapped to 'sku' (confidence: 85%)",
        "Field 'qty_available' mapped to 'stock_on_hand' (confidence: 90%)"
      ]
    }
  }
}
```

## 🔧 Technical Implementation

### AI Field Mapping Algorithm
1. **Sample Analysis**: Analyzes first 5 rows to detect patterns
2. **Pattern Matching**: Uses multiple matching strategies:
   - Exact string matching
   - Substring matching  
   - Levenshtein distance (fuzzy matching)
   - Contextual analysis
3. **Confidence Scoring**: Calculates mapping confidence (0.0 - 1.0)
4. **Fallback Strategy**: Uses multiple field name variations

### Data Processing Pipeline
```typescript
Raw CSV Data → AI Field Mapping → Smart Parsing → Validation → Database Insert
```

### Performance Optimizations
- **Batch Processing**: 50 items per batch
- **Efficient Parsing**: Single-pass data processing
- **Memory Management**: Streaming for large files
- **Error Isolation**: Failed items don't affect others

## 🧪 Testing the AI System

### Debug Console (`/debug/inventory`)
- Interactive AI mapping testing
- Real-time confidence reporting
- Field mapping visualization
- Error analysis and suggestions

### API Testing
```javascript
// Test with various column formats
const testData = [
  {
    "Product Name": "AI Test Item",
    "Item Code": "AI-001", 
    "Product Type": "Electronics",
    "Retail Price": "$99.99",
    "Units Available": "5 pcs"
  }
];

fetch('/api/inventory/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: testData })
});
```

## 📈 Benefits

### For End Users
- **Flexible CSV Support**: No need to format CSVs to exact specifications
- **Reduced Errors**: AI catches and corrects common data issues
- **Time Savings**: Automatic field mapping eliminates manual configuration
- **Quality Assurance**: Built-in data validation and cleaning

### For Developers  
- **Maintainable**: Centralized parsing logic
- **Extensible**: Easy to add new field variations
- **Debuggable**: Detailed logging and confidence reporting
- **Reliable**: Comprehensive error handling

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning**: Learn from user corrections to improve mapping
- **Advanced OCR**: Extract data from scanned documents
- **Multi-language Support**: Handle international field names
- **Template Learning**: Remember successful mappings for future imports
- **Data Enrichment**: Automatically fill missing fields using external APIs

---

**The AI-powered bulk import system ensures maximum compatibility with various data formats while maintaining high data quality and providing transparent feedback about the import process.**