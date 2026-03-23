import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const post = request.nextUrl.searchParams.get('post');

    if (post) {
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
