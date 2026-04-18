import { NextResponse } from 'next/server';
import { computeSeoOverview } from '@/lib/seo/analysis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD;
}

/**
 * GET /api/admin/seo/overview
 *
 * Returns keyword density + persona coverage + opportunities across all
 * published blog posts, compared tegen de seed keyword-universe.
 */
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const overview = await computeSeoOverview();
    return NextResponse.json(overview);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('SEO overview failed:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
