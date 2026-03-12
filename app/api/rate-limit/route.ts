import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
    try {
        const { identifier, maxAttempts, windowMs } = await request.json()

        if (!identifier) {
            return NextResponse.json(
                { error: 'Identifier is required' },
                { status: 400 }
            )
        }

        const result = await checkRateLimit(
            identifier,
            maxAttempts || 5,
            windowMs || 15 * 60 * 1000
        )

        return NextResponse.json(result)
    } catch (error) {
        console.error('Rate limit API error:', error)
        return NextResponse.json(
            { error: 'Internal server error', allowed: true, remaining: 4, resetTime: Date.now() + 900000 },
            { status: 500 }
        )
    }
}
