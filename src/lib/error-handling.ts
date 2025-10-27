/**
 * Secure Error Handling Utility
 * Prevents sensitive information exposure in error responses
 */

import { NextResponse } from 'next/server';

export interface ErrorContext {
  endpoint: string;
  userId?: string;
  method: string;
  userAgent?: string;
  ip?: string;
}

export interface ErrorDetails {
  type: string;
  message: string;
  code?: string;
  statusCode: number;
}

/**
 * Patterns that indicate sensitive information that should be redacted
 */
const SENSITIVE_PATTERNS = [
  /password/gi,
  /secret/gi,
  /key/gi,
  /token/gi,
  /credential/gi,
  /api[_-]?key/gi,
  /auth[_-]?token/gi,
  /bearer/gi,
  /jwt/gi,
  /database/gi,
  /connection/gi,
  /supabase/gi,
  /redis/gi,
  /postgresql/gi,
  /sql/gi,
  /env/gi,
  /config/gi
];

/**
 * Database error patterns that should be sanitized
 */
const DB_ERROR_PATTERNS = [
  { pattern: /duplicate key value violates unique constraint/gi, message: 'A record with this information already exists' },
  { pattern: /foreign key constraint/gi, message: 'Related record not found' },
  { pattern: /not-null constraint/gi, message: 'Required field is missing' },
  { pattern: /check constraint/gi, message: 'Invalid data format' },
  { pattern: /relation .* does not exist/gi, message: 'Database configuration error' },
  { pattern: /column .* does not exist/gi, message: 'Invalid request format' },
  { pattern: /syntax error/gi, message: 'Invalid request format' },
  { pattern: /connection refused/gi, message: 'Service temporarily unavailable' },
  { pattern: /timeout/gi, message: 'Request timeout' }
];

/**
 * Sanitizes error messages to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  let sanitized = message;

  // Replace database-specific errors with user-friendly messages
  for (const { pattern, message: replacement } of DB_ERROR_PATTERNS) {
    if (pattern.test(sanitized)) {
      return replacement;
    }
  }

  // Remove sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  // Remove file paths
  sanitized = sanitized.replace(/\/[^\s]*\.[a-z]+/gi, '[PATH]');
  
  // Remove stack trace details in production
  if (process.env.NODE_ENV === 'production') {
    const lines = sanitized.split('\n');
    sanitized = lines[0]; // Only keep the first line
  }

  return sanitized;
}

/**
 * Logs errors securely with appropriate detail level
 */
function logError(error: Error, context: ErrorContext, details?: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    endpoint: context.endpoint,
    method: context.method,
    userId: context.userId || 'anonymous',
    ip: context.ip || 'unknown',
    userAgent: context.userAgent || 'unknown',
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : '[REDACTED]'
    },
    details: process.env.NODE_ENV === 'development' ? details : '[REDACTED]'
  };

  console.error('🚨 [SECURITY ERROR]', JSON.stringify(logEntry, null, 2));
}

/**
 * Creates appropriate error responses based on error type and environment
 */
export function createErrorResponse(
  error: Error | string,
  context: ErrorContext,
  statusCode: number = 500,
  details?: any
): NextResponse {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  // Log the full error internally
  logError(errorObj, context, details);

  // Determine appropriate user-facing message
  let userMessage: string;
  let errorCode: string;

  switch (statusCode) {
    case 400:
      userMessage = 'Invalid request format';
      errorCode = 'BAD_REQUEST';
      break;
    case 401:
      userMessage = 'Authentication required';
      errorCode = 'UNAUTHORIZED';
      break;
    case 403:
      userMessage = 'Access denied';
      errorCode = 'FORBIDDEN';
      break;
    case 404:
      userMessage = 'Resource not found';
      errorCode = 'NOT_FOUND';
      break;
    case 409:
      userMessage = 'Resource conflict';
      errorCode = 'CONFLICT';
      break;
    case 429:
      userMessage = 'Too many requests';
      errorCode = 'RATE_LIMITED';
      break;
    case 500:
    default:
      userMessage = 'Internal server error';
      errorCode = 'INTERNAL_ERROR';
      break;
  }

  // In development, provide more detail
  if (process.env.NODE_ENV === 'development') {
    const sanitizedMessage = sanitizeErrorMessage(errorObj.message);
    userMessage = sanitizedMessage || userMessage;
  }

  const response = {
    error: true,
    code: errorCode,
    message: userMessage,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        endpoint: context.endpoint,
        originalMessage: sanitizeErrorMessage(errorObj.message)
      }
    })
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Validates that error responses don't leak sensitive information
 */
export function validateErrorResponse(response: any): boolean {
  const responseString = JSON.stringify(response).toLowerCase();
  
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(responseString)) {
      console.warn('🚨 [SECURITY WARNING] Error response contains sensitive information');
      return false;
    }
  }
  
  return true;
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<NextResponse>,
  endpoint: string
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      const context: ErrorContext = {
        endpoint,
        method: req.method,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
      };

      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
          statusCode = 401;
        } else if (error.message.includes('forbidden') || error.message.includes('access denied')) {
          statusCode = 403;
        } else if (error.message.includes('not found')) {
          statusCode = 404;
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          statusCode = 400;
        }
      }

      return createErrorResponse(error as Error, context, statusCode);
    }
  };
}

/**
 * Database error handler specifically for Supabase/PostgreSQL errors
 */
export function handleDatabaseError(error: any, context: ErrorContext): NextResponse {
  let statusCode = 500;
  let userMessage = 'Database operation failed';

  // Handle specific PostgreSQL error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        statusCode = 409;
        userMessage = 'A record with this information already exists';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        userMessage = 'Related record not found';
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        userMessage = 'Required field is missing';
        break;
      case '23514': // check_violation
        statusCode = 400;
        userMessage = 'Invalid data format';
        break;
      case '42P01': // undefined_table
      case '42703': // undefined_column
        statusCode = 500;
        userMessage = 'Database configuration error';
        break;
      default:
        // Use generic message for unknown codes
        break;
    }
  }

  return createErrorResponse(new Error(userMessage), context, statusCode, {
    dbErrorCode: error.code,
    dbErrorDetail: process.env.NODE_ENV === 'development' ? error.detail : '[REDACTED]'
  });
}