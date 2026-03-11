import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security middleware with defense-in-depth approach
 * Implements multiple security headers and protections
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers

    // Content Security Policy - Prevents XSS attacks
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires these
            "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co https://api.coingecko.com",
            "frame-ancestors 'none'", // Prevent clickjacking
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ')
    )

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Enable XSS protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Referrer Policy - Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions Policy - Restrict browser features
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    // Strict Transport Security - Enforce HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        )
    }

    // Remove server information
    response.headers.delete('X-Powered-By')

    // Cache control for sensitive pages
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        )
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
    }

    return response
}

// Configure which routes to apply middleware to
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
