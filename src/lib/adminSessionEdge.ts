export const ADMIN_SESSION_COOKIE = 'raj_admin_session';
export const AUTHORIZED_ADMIN_EMAIL = 'rahulmathuriya7878@gmail.com';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminSessionPayload {
  email: string;
  uid: string;
  mode: 'firebase' | 'passcode';
  exp: number;
}

const RUNTIME_SECRET_KEY = '__raj_admin_runtime_session_secret__';

function getSessionSecret(): string {
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  const g = globalThis as Record<string, unknown>;
  if (typeof g[RUNTIME_SECRET_KEY] !== 'string' || (g[RUNTIME_SECRET_KEY] as string).length < 32) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    g[RUNTIME_SECRET_KEY] = hex;
  }
  return g[RUNTIME_SECRET_KEY] as string;
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
    if (decoded.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
