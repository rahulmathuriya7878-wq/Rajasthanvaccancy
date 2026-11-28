import { NextRequest, NextResponse } from 'next/server';
import {
  AUTHORIZED_ADMIN_EMAIL,
  buildAdminCookieHeader,
  createAdminSessionToken,
  requireAdminRequest,
  timingSafeEqualStrings,
  verifyCsrfOrigin,
  verifyFirebaseAdminIdToken,
} from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const check = await requireAdminRequest(request);
  if (!check.authorized) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    email: check.session.email,
    mode: check.session.mode,
  });
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }

  let body: { idToken?: string; passcode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Prefer verified Firebase Google ID Token
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  const idToken = bearerToken || (typeof body.idToken === 'string' ? body.idToken.trim() : '');

  if (idToken) {
    const verified = await verifyFirebaseAdminIdToken(idToken);
    if (!verified.ok) {
      return NextResponse.json({ ok: false, error: verified.error }, { status: 401 });
    }
    const sessionToken = await createAdminSessionToken({
      email: verified.email,
      uid: verified.uid,
      mode: 'firebase',
    });
    const res = NextResponse.json({
      ok: true,
      email: verified.email,
      mode: 'firebase',
    });
    res.headers.append('Set-Cookie', buildAdminCookieHeader(sessionToken));
    return res;
  }

  // Optional server-side environment passcode verification (never hardcoded)
  const configuredPasscode = (
    process.env.ADMIN_PANEL_PASSCODE ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PIN ||
    ''
  ).trim();
  const submittedPasscode = typeof body.passcode === 'string' ? body.passcode.trim() : '';
  if (submittedPasscode) {
    if (!configuredPasscode) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'पासवर्ड/पिन सर्वर की .env फाइल में सेट नहीं है। कृपया .env में ADMIN_PANEL_PASSCODE (या ADMIN_PASSWORD / ADMIN_PIN) सेट करें, या Google एडमिन से लॉगिन करें।',
        },
        { status: 401 }
      );
    }
    if (!timingSafeEqualStrings(submittedPasscode, configuredPasscode)) {
      return NextResponse.json(
        { ok: false, error: 'गलत एडमिन पासवर्ड/पिन (Invalid admin passcode).' },
        { status: 401 }
      );
    }
    const sessionToken = await createAdminSessionToken({
      email: AUTHORIZED_ADMIN_EMAIL,
      uid: 'passcode-admin',
      mode: 'passcode',
    });
    const res = NextResponse.json({
      ok: true,
      email: AUTHORIZED_ADMIN_EMAIL,
      mode: 'passcode',
    });
    res.headers.append('Set-Cookie', buildAdminCookieHeader(sessionToken));
    return res;
  }

  return NextResponse.json(
    { ok: false, error: 'Sign in with your verified Google Admin account or enter your .env admin passcode.' },
    { status: 401 }
  );
}

export async function DELETE(request: NextRequest) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', buildAdminCookieHeader('', 0));
  return res;
}
