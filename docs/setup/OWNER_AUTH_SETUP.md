
# Owner Authentication System Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Owner Authentication Credentials
OWNER_MASTER_KEY=your_super_secure_master_key_here
OWNER_ACCESS_CODE=your_secondary_access_code_here  
OWNER_VERIFICATION_PIN=123456

# Alternative: Use hashed versions for additional security
# OWNER_MASTER_KEY_HASH=sha256_hash_of_master_key
# OWNER_ACCESS_CODE_HASH=sha256_hash_of_access_code

# Required for JWT token signing
JWT_SECRET=your_jwt_secret_key_for_owner_sessions

# Salt for hashing (optional, defaults to 'ghost_crm_salt')
AUTH_SALT=your_custom_salt_for_hashing
```

## Security Recommendations

### 1. Master Key
- Use a complex, randomly generated string (minimum 32 characters)
- Include uppercase, lowercase, numbers, and symbols
- Example: `Gh0st_CRM_M4st3r_K3y_2024!@#$%^&*`

### 2. Access Code
- Different from master key
- Should be memorable but secure
- Example: `CRM_Admin_Access_2024`

### 3. Verification PIN
- 6-digit numeric code
- Change regularly
- Example: `789123`

### 4. Production Security
For production environments, consider:
- Using hashed versions instead of plain text
- Rotating credentials regularly
- Implementing additional 2FA
- Monitoring all owner access attempts

## Owner Authentication Flow

1. **Step 1**: Master Key verification
2. **Step 2**: Access Code verification  
3. **Step 3**: Verification PIN validation
4. **Success**: 24-hour owner session created

## Access Levels

### Owner Session Grants:
- ✅ All tenant data access
- ✅ All user information 
- ✅ System metrics and analytics
- ✅ AI Agent management
- ✅ Security monitoring
- ✅ System configuration
- ✅ Audit log access
- ✅ Database direct access

### Regular User Restrictions:
- ❌ Cannot access owner portal
- ❌ No cross-tenant data access
- ❌ No system administration
- ❌ No AI agent controls
- ❌ Limited to their tenant scope

## Security Features

- **Multi-step authentication** (3 layers)
- **Session-based access** (24-hour expiry)
- **Comprehensive audit logging** (all attempts logged)
- **IP address tracking** (for security monitoring)
- **Rate limiting** (delays on failed attempts)
- **Secure session cookies** (httpOnly, secure flags)
- **JWT token validation** (signed and verified)

## Usage

1. Navigate to `/owner/login`
2. Complete 3-step authentication
3. Access owner dashboard at `/owner/dashboard`
4. Use API endpoints with owner privileges

## API Endpoints

- `POST /api/owner/auth/verify-master` - Step 1 verification
- `POST /api/owner/auth/verify-access` - Step 2 verification  
- `POST /api/owner/auth/login` - Final login & session creation
- `GET /api/owner/system?type=overview` - System data access

All API endpoints require valid owner session tokens.