/**
 * Database Input Validation and SQL Injection Prevention
 * Provides utilities for sanitizing and validating database inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

/**
 * Common SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)|(\-\-)|(\;)|(\*)|(\|)|(\&)|(\^)|(\%)|(\$)/gi,
  /(\'|\'\'|\")|(\|\|)|(\+)/g,
  /(UNION|OR|AND)\s+\d+\s*=\s*\d+/gi,
  /\b(SCRIPT|JAVASCRIPT|VBSCRIPT|IFRAME|OBJECT|EMBED|APPLET)\b/gi
];

/**
 * Basic HTML sanitization without external dependencies
 */
function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes email addresses
 */
export function validateEmail(email: any): ValidationResult {
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email too long' };
  }

  return { isValid: true, sanitized };
}

/**
 * Validates and sanitizes passwords
 */
export function validatePassword(password: any): ValidationResult {
  if (typeof password !== 'string') {
    return { isValid: false, error: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long' };
  }

  // Check for basic strength requirements
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUpper || !hasLower || !hasNumber) {
    return { 
      isValid: false, 
      error: 'Password must contain uppercase, lowercase, and numeric characters' 
    };
  }

  return { isValid: true, sanitized: password };
}

/**
 * Validates and sanitizes text input for SQL safety
 */
export function validateTextInput(input: any, maxLength: number = 255): ValidationResult {
  if (input === null || input === undefined) {
    return { isValid: true, sanitized: null };
  }

  if (typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'Input contains potentially dangerous characters' };
    }
  }

  const sanitized = sanitizeHtml(input.trim());
  
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Input exceeds maximum length of ${maxLength}` };
  }

  return { isValid: true, sanitized };
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: any): ValidationResult {
  if (typeof uuid !== 'string') {
    return { isValid: false, error: 'UUID must be a string' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true, sanitized: uuid.toLowerCase() };
}

/**
 * Validates integer input
 */
export function validateInteger(input: any, min?: number, max?: number): ValidationResult {
  const num = parseInt(input, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Input must be a valid integer' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }

  return { isValid: true, sanitized: num };
}

/**
 * Validates and sanitizes JSON input
 */
export function validateJSON(input: any): ValidationResult {
  if (input === null || input === undefined) {
    return { isValid: true, sanitized: null };
  }

  try {
    let parsed;
    if (typeof input === 'string') {
      parsed = JSON.parse(input);
    } else {
      parsed = input;
    }

    // Basic size check to prevent DoS
    const jsonString = JSON.stringify(parsed);
    if (jsonString.length > 10000) { // 10KB limit
      return { isValid: false, error: 'JSON data too large' };
    }

    return { isValid: true, sanitized: parsed };
  } catch (e) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validates database table/column names (for dynamic queries)
 */
export function validateDatabaseIdentifier(identifier: any): ValidationResult {
  if (typeof identifier !== 'string') {
    return { isValid: false, error: 'Database identifier must be a string' };
  }

  // Only allow alphanumeric characters, underscores, and specific length
  const identifierRegex = /^[a-zA-Z][a-zA-Z0-9_]{0,62}$/;
  
  if (!identifierRegex.test(identifier)) {
    return { 
      isValid: false, 
      error: 'Invalid database identifier format' 
    };
  }

  // Prevent SQL keywords
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'WHERE', 'FROM', 'INTO', 'VALUES'
  ];
  
  if (sqlKeywords.includes(identifier.toUpperCase())) {
    return { isValid: false, error: 'Database identifier cannot be a SQL keyword' };
  }

  return { isValid: true, sanitized: identifier.toLowerCase() };
}

/**
 * Comprehensive request body validation
 */
export function validateRequestBody<T>(
  body: any,
  schema: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: string[]; data?: any } {
  const errors: string[] = [];
  const data: any = {};

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(body[key]);
    
    if (!result.isValid) {
      errors.push(`${key}: ${result.error}`);
    } else {
      data[key] = result.sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined
  };
}

/**
 * Escape string for LIKE queries (PostgreSQL)
 */
export function escapeLikeQuery(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}