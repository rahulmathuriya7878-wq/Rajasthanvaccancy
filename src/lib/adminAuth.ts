import { NextRequest } from 'next/server';
import firebaseConfig from '../../firebase-applet-config.json';

export const ADMIN_SESSION_COOKIE = 'raj_admin_session';
export const AUTHORIZED_ADMIN_EMAIL = 'rahulmathuriya7878@gmail.com';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminSessionPayload {
  email: string;
  uid: string;
  mode: 'firebase' | 'passcode';
  exp: number;
}

let runtimeFallbackSecret: string | null = null;

function getSessionSecret(): string {
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (!runtimeFallbackSecret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    runtimeFallbackSecret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return runtimeFallbackSecret;
}

function base64UrlEncode(input: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < input.length; i++) {
    binary += String.fromCharCode(input[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export async function createAdminSessionToken(
  data: Omit<AdminSessionPayload, 'exp'>
): Promise<string> {
  const payload: AdminSessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadPart = base64UrlEncode(payloadBytes);
  const key = await importHmacKey(getSessionSecret());
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadPart));
  const sigPart = base64UrlEncode(new Uint8Array(sigBuf));
  return `${payloadPart}.${sigPart}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadPart, sigPart] = parts;
  if (!payloadPart || !sigPart) return null;

  try {
    const key = await importHmacKey(getSessionSecret());
    const sigBytes = base64UrlDecode(sigPart);
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigCopy,
      new TextEncoder().encode(payloadPart)
    );
    if (!valid) return null;

    const decoded = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as AdminSessionPayload;
    if (!decoded || typeof decoded.exp !== 'number' || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!decoded.email || !decoded.uid) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyFirebaseAdminIdToken(
  idToken: string
): Promise<
  | { ok: true; email: string; uid: string; error?: undefined }
  | { ok: false; email?: undefined; uid?: undefined; error: string }
> {
  const apiKey = firebaseConfig?.apiKey;
  if (!apiKey || !idToken || idToken.length < 20) {
    return { ok: false, error: 'Missing Firebase token or configuration.' };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!res.ok) {
      return { ok: false, error: 'Firebase token verification failed.' };
    }

    const json = (await res.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const user = json.users?.[0];
    if (!user || !user.email || !user.localId) {
      return { ok: false, error: 'Invalid Firebase user record.' };
    }
    if (!user.emailVerified) {
      return { ok: false, error: 'Admin email must be verified.' };
    }
    if (user.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return { ok: false, error: 'This Google account is not authorized as portal admin.' };
    }

    return { ok: true, email: user.email, uid: user.localId };
  } catch {
    return { ok: false, error: 'Unable to contact Firebase Auth verification endpoint.' };
  }
}

export function verifyCsrfOrigin(request: NextRequest): boolean {
  const requestedWith = request.headers.get('x-requested-with');
  if (requestedWith === 'XMLHttpRequest') return true;

  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
  if (!host) return false;

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  return false;
}

export async function requireAdminRequest(
  request: NextRequest
): Promise<
  | { authorized: true; session: AdminSessionPayload; error?: undefined }
  | { authorized: false; session?: undefined; error: string }
> {
  // 1. Check Bearer Firebase ID Token first
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = await verifyFirebaseAdminIdToken(token);
    if (verified.ok) {
      return {
        authorized: true,
        session: {
          email: verified.email,
          uid: verified.uid,
          mode: 'firebase',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      };
    }
    return { authorized: false, error: verified.error };
  }

  // 2. Check signed HttpOnly admin session cookie (with CSRF origin verification for mutations)
  if (request.method !== 'GET' && request.method !== 'HEAD' && !verifyCsrfOrigin(request)) {
    return { authorized: false, error: 'Cross-site request blocked.' };
  }

  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(cookieToken);
  if (session) {
    return { authorized: true, session };
  }

  return { authorized: false, error: 'Admin authentication required.' };
}

export function buildAdminCookieHeader(token: string, maxAgeSeconds = SESSION_TTL_SECONDS): string {
  const securePart = process.env.NODE_ENV === 'production' ? '; Secure; SameSite=None; Partitioned' : '; SameSite=Lax';
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${maxAgeSeconds}${securePart}`;
}
