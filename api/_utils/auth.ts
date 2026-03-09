// Authentication utilities for Edge Runtime
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const PERSONAL_PASSPHRASE = process.env.AUTH_PASSPHRASE_PERSONAL || '';
const SHOWCASE_PASSPHRASE = process.env.AUTH_PASSPHRASE_SHOWCASE || '';

export type UserType = 'personal' | 'showcase';

interface TokenPayload {
  userType: UserType;
}

// Rate limiting store (in-memory for Edge Runtime)
// Note: This is per-isolate; for production, use Redis/KV
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to avoid leaking length via timing
    const dummy = b;
    let result = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result |= (a.charCodeAt(i) || 0) ^ (dummy.charCodeAt(i % dummy.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function validatePassphrase(passphrase: string): UserType | null {
  if (constantTimeCompare(passphrase, PERSONAL_PASSPHRASE)) {
    return 'personal';
  }
  if (constantTimeCompare(passphrase, SHOWCASE_PASSPHRASE)) {
    return 'showcase';
  }
  return null;
}

export async function createToken(userType: UserType): Promise<string> {
  return new SignJWT({ userType })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload && typeof payload.userType === 'string') {
      return { userType: payload.userType as UserType };
    }
    return null;
  } catch {
    return null;
  }
}

export function createAuthCookie(token: string): string {
  const maxAge = 24 * 60 * 60; // 24 hours in seconds
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
}

export function createClearCookie(): string {
  return 'auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
}

export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value || null;
    }
  }
  return null;
}
