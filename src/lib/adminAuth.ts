import { NextRequest } from 'next/server';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ADMIN_SESSION_COOKIE,
  AUTHORIZED_ADMIN_EMAIL,
  SESSION_TTL_SECONDS,
  type AdminSessionPayload,
  createAdminSessionToken,
  timingSafeEqualStrings,
  verifyAdminSessionToken,
} from './adminSessionEdge';

export {
  ADMIN_SESSION_COOKIE,
  AUTHORIZED_ADMIN_EMAIL,
  type AdminSessionPayload,
  createAdminSessionToken,
  timingSafeEqualStrings,
  verifyAdminSessionToken,
};

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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    let res: Response;
    try {
      res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timer);
    }

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
    if (
      user.emailVerified === false ||
      user.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()
    ) {
      return { ok: false, error: 'Unauthorized Google account for admin access.' };
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
