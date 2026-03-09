import {
  validatePassphrase,
  createToken,
  createAuthCookie,
  checkRateLimit
} from '../_utils/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many attempts. Try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { passphrase } = body;

    if (!passphrase || typeof passphrase !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid passphrase' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate passphrase
    const userType = validatePassphrase(passphrase);

    if (!userType) {
      // Generic error to prevent user enumeration
      return new Response(JSON.stringify({ error: 'Invalid passphrase' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create JWT
    const token = await createToken(userType);
    
    // Set cookie
    const cookie = createAuthCookie(token);

    return new Response(JSON.stringify({ 
      success: true, 
      userType 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });

  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
