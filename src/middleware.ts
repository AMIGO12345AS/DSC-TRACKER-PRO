import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is currently disabled.
// The application uses a simulated user-switching model instead of a real login flow.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add paths here to reactivate middleware
  ],
}
