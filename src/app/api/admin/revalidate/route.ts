import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/adminAuth';

const SAFE_REVALIDATE_PATHS = new Set([
  '/',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/rss.xml',
  '/photo-signature-resize-tool',
]);

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminRequest(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ ok: false, error: authCheck.error }, { status: 401 });
  }

  let body: { slug?: string; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const revalidated: string[] = [];

  try {
    const requestedPaths = Array.isArray(body.paths)
      ? body.paths.filter((p): p is string => typeof p === 'string' && SAFE_REVALIDATE_PATHS.has(p))
      : [];

    const targets = Array.from(new Set(['/', '/sitemap.xml', '/rss.xml', ...requestedPaths]));
    for (const path of targets) {
      revalidatePath(path);
      revalidated.push(path);
    }

    return NextResponse.json({
      ok: true,
      revalidated,
      slug: typeof body.slug === 'string' ? body.slug.slice(0, 128) : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Revalidation failed' },
      { status: 500 }
    );
  }
}
