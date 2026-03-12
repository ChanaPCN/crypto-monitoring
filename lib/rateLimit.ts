/**
 * Database-backed rate limiting utilities
 * Persistent across server restarts and deployments
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Initialize Supabase client with service role for rate limiting operations
// Only create if both URL and key are available
let supabaseAdmin: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetTime: number
}

interface RateLimitRecord {
    id: string
    identifier: string
    count: number
    reset_time: string
    created_at: string
    updated_at: string
}

/**
 * Database-backed rate limiter
 * @param identifier - Unique identifier (e.g., "signup:fingerprint", "login:email")
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export async function checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
    const now = Date.now()
    const resetTime = now + windowMs

    // If Supabase admin client is not available, fail open (allow the request)
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not configured. Rate limiting disabled.')
        return { allowed: true, remaining: maxAttempts - 1, resetTime }
    }

    try {
        // Try to get existing rate limit record
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('rate_limits')
            .select('*')
            .eq('identifier', identifier)
            .maybeSingle() as { data: RateLimitRecord | null, error: any }

        if (fetchError) {
            console.error('Rate limit check error:', fetchError)
            // Fail open - allow the request if database is having issues
            return { allowed: true, remaining: maxAttempts - 1, resetTime }
        }

        const resetTimeFromDb = existing ? new Date(existing.reset_time).getTime() : 0

        // If no record exists or the window has expired, create/reset
        if (!existing || now > resetTimeFromDb) {
            const { error: upsertError } = await (supabaseAdmin
                .from('rate_limits') as any)
                .upsert({
                    identifier,
                    count: 1,
                    reset_time: new Date(resetTime).toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'identifier'
                })

            if (upsertError) {
                console.error('Rate limit upsert error:', upsertError)
                return { allowed: true, remaining: maxAttempts - 1, resetTime }
            }

            return { allowed: true, remaining: maxAttempts - 1, resetTime }
        }

        // Check if limit is exceeded
        if (existing.count >= maxAttempts) {
            return { allowed: false, remaining: 0, resetTime: resetTimeFromDb }
        }

        // Increment the counter
        const newCount = existing.count + 1
        const { error: updateError } = await (supabaseAdmin
            .from('rate_limits') as any)
            .update({
                count: newCount,
                updated_at: new Date().toISOString()
            })
            .eq('identifier', identifier)

        if (updateError) {
            console.error('Rate limit update error:', updateError)
            return { allowed: true, remaining: maxAttempts - existing.count - 1, resetTime: resetTimeFromDb }
        }

        return {
            allowed: true,
            remaining: maxAttempts - newCount,
            resetTime: resetTimeFromDb
        }

    } catch (error) {
        console.error('Rate limit error:', error)
        // Fail open - allow the request if something goes wrong
        return { allowed: true, remaining: maxAttempts - 1, resetTime }
    }
}

/**
 * Reset rate limit for a specific identifier
 * @param identifier - The identifier to reset
 */
export async function resetRateLimit(identifier: string): Promise<void> {
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not configured. Cannot reset rate limit.')
        return
    }

    try {
        await (supabaseAdmin
            .from('rate_limits') as any)
            .delete()
            .eq('identifier', identifier)
    } catch (error) {
        console.error('Rate limit reset error:', error)
    }
}

/**
 * Clean up expired rate limit records
 * Can be called periodically or via cron job
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not configured. Cannot cleanup rate limits.')
        return
    }

    try {
        const { error } = await supabaseAdmin.rpc('cleanup_expired_rate_limits')
        if (error) {
            console.error('Rate limit cleanup error:', error)
        }
    } catch (error) {
        console.error('Rate limit cleanup error:', error)
    }
}

