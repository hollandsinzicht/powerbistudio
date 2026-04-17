import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPostById, updatePost } from '@/lib/blog-store';
import { generateBlogImage } from '@/lib/image-generator';

// Image generation kan tijd kosten (Mystic async + upload)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token');
  return auth === ADMIN_PASSWORD;
}

/**
 * POST /api/admin/regenerate-blog-image
 * Body: { postId: string }
 *
 * Regenereert de header-afbeelding van één specifieke blogpost via de
 * Freepik pipeline (AI generatie + stock fallback) en updatet blog_posts.image.
 */
export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { postId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { postId } = body;
  if (!postId) {
    return NextResponse.json({ error: 'postId ontbreekt' }, { status: 400 });
  }

  try {
    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Blog post niet gevonden' }, { status: 404 });
    }

    const imageUrl = await generateBlogImage({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image generatie mislukt (zowel AI als stock fallback).' },
        { status: 502 },
      );
    }

    await updatePost(postId, { image: imageUrl });

    // Revalidate blog paths zodat de nieuwe image direct zichtbaar is
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ ok: true, imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Regenerate blog image failed:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
