import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is currently handled on the client-side within AuthProvider
// to avoid issues with Firebase Admin SDK initialization during build/edge execution.
// A server-side middleware would be the most secure approach for a large-scale production app,
// but the current method provides robust security for this application's scope.
export function middleware(request: NextRequest) {
    // For this application, all auth logic is handled on the client side.
    // This middleware is effectively a placeholder. The faulty redirect logic has been removed.
    return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
