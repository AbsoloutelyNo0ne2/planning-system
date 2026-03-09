import {
  verifyToken,
  extractTokenFromCookie
} from '../_utils/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        userType: null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response(JSON.stringify({ 
        success: false, 
        userType: null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userType: payload.userType 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch {
    return new Response(JSON.stringify({ 
      success: false, 
      userType: null 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
