/**
 * Secure CORS Configuration
 * Implements strict CORS validation to prevent cross-origin attacks
 */

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

// Default secure CORS configuration
const defaultConfig: CORSConfig = {
  allowedOrigins: [
    process.env.NODE_ENV === 'production' 
      ? 'https://ghostdefenses.com'
      : 'http://localhost:3000',
    // Allow Vercel deployment domains
    'https://ghostcrm-liard.vercel.app',
    // Add specific tenant domains if needed
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  maxAge: 86400, // 24 hours
  credentials: true
};

/**
 * Validates if the request origin is allowed
 */
export function isOriginAllowed(origin: string | null, config: CORSConfig = defaultConfig): boolean {
  if (!origin) {
    // Allow same-origin requests (no Origin header)
    return true;
  }

  // Check against exact matches first
  if (config.allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel deployment domains
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    // Invalid URL, continue with other checks
  }

  // For development, allow localhost with any port
  if (process.env.NODE_ENV === 'development') {
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Applies secure CORS headers to a response
 */
export function applyCORSHeaders(
  response: Response, 
  request: Request, 
  config: CORSConfig = defaultConfig
): Response {
  const origin = request.headers.get('origin');
  
  if (isOriginAllowed(origin, config)) {
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    if (config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  // Additional security headers
  response.headers.set('Vary', 'Origin');
  
  return response;
}

/**
 * Handles preflight OPTIONS requests
 */
export function handlePreflight(request: Request, config: CORSConfig = defaultConfig): Response {
  const origin = request.headers.get('origin');
  
  if (!isOriginAllowed(origin, config)) {
    return new Response(null, { status: 403 });
  }

  const response = new Response(null, { status: 204 });
  return applyCORSHeaders(response, request, config);
}

/**
 * Wrapper for API routes that automatically applies CORS
 */
export function withCORS(
  handler: (request: Request) => Promise<Response>,
  config: CORSConfig = defaultConfig
) {
  return async (request: Request): Promise<Response> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, config);
    }

    // Validate origin for non-preflight requests
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin, config)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Execute the handler
    const response = await handler(request);
    
    // Apply CORS headers to the response
    return applyCORSHeaders(response, request, config);
  };
}