import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const post = searchParams.get('post');

    // Redirect /blog?post=slug → /blog/slug
    if (pathname === '/blog' && post) {
        const url = request.nextUrl.clone();
        url.pathname = `/blog/${post}`;
        url.searchParams.delete('post');
        return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/blog',
};
