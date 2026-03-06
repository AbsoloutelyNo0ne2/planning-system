import { createClearCookie } from '../_utils/auth';

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

  const cookie = createClearCookie();

  return new Response(JSON.stringify({ 
    success: true 
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}
