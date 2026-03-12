/**
 * Security utilities for the application
 * Implements defense-in-depth security measures
 */

import { createHash } from 'crypto'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiter to prevent brute force attacks
 * @param identifier - Usually IP address or user ID
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || now > record.resetTime) {
        // New window or expired
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        })
        return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
    }

    if (record.count >= maxAttempts) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: maxAttempts - record.count, resetTime: record.resetTime }
}

/**
 * Validate email format with RFC 5322 compliant regex
 * More permissive to accept valid emails
 */
export function validateEmail(email: string): boolean {
    // Basic sanity checks
    if (!email || email.length > 254) {
        return false
    }

    // More permissive regex that allows common email formats
    // Including Gmail with numbers, dots, plus signs, etc.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
        return false
    }

    // Additional checks
    const parts = email.split('@')
    if (parts.length !== 2) {
        return false
    }

    const [localPart, domainPart] = parts

    // Check local part (before @)
    if (localPart.length === 0 || localPart.length > 64) {
        return false
    }

    // Check domain part (after @)
    if (domainPart.length === 0 || domainPart.length > 255) {
        return false
    }

    // Domain must have at least one dot
    if (!domainPart.includes('.')) {
        return false
    }

    return true
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character')
    }

    // Check for common patterns
    const commonPatterns = ['12345', 'password', 'qwerty', 'admin', 'letmein']
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        errors.push('Password contains common patterns')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
    if (!input) return ''

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
        .slice(0, 1000) // Limit length
}

/**
 * Validate numeric input for crypto amounts
 */
export function validateCryptoAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(num) || num <= 0 || num > 1e12) {
        return false
    }

    // Check for reasonable decimal places (max 18 for crypto)
    const decimalPlaces = amount.toString().split('.')[1]?.length || 0
    return decimalPlaces <= 18
}

/**
 * Validate price input
 */
export function validatePrice(price: string | number): boolean {
    const num = typeof price === 'string' ? parseFloat(price) : price

    if (isNaN(num) || num <= 0 || num > 1e9) {
        return false
    }

    return true
}

/**
 * Generate secure fingerprint for browser identification
 */
export function generateBrowserFingerprint(): string {
    if (typeof window === 'undefined') return 'server'

    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.colorDepth,
        screen.width + 'x' + screen.height,
    ]

    return btoa(components.join('|'))
}

/**
 * Validate and sanitize coin symbol
 */
export function validateCoinSymbol(symbol: string): boolean {
    // Only allow alphanumeric characters, max 10 chars
    return /^[A-Z0-9]{1,10}$/i.test(symbol)
}

/**
 * Validate date input
 */
export function validateDate(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const minDate = new Date('2009-01-01') // Bitcoin genesis

    return !isNaN(date.getTime()) &&
        date <= now &&
        date >= minDate
}

/**
 * Secure error messages - don't expose sensitive information
 */
export function sanitizeErrorMessage(error: any): string {
    const message = error?.message || 'An error occurred'

    // Remove sensitive data patterns
    const sanitized = message
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // IP addresses
        .replace(/Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g, '[TOKEN]') // Tokens
        .replace(/[a-f0-9]{32,}/gi, '[HASH]') // Hashes
        .replace(/password|pwd|pass/gi, '[CREDENTIAL]') // Password references

    // Generic error for database/auth issues
    if (sanitized.includes('database') || sanitized.includes('SQL')) {
        return 'A database error occurred. Please try again later.'
    }

    if (sanitized.includes('auth') || sanitized.includes('token')) {
        return 'Authentication failed. Please try again.'
    }

    return sanitized
}

/**
 * Validate environment variables on startup
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]

    for (const key of required) {
        if (!process.env[key]) {
            errors.push(`Missing required environment variable: ${key}`)
        } else if (process.env[key]?.includes('your_') || process.env[key]?.includes('placeholder')) {
            errors.push(`Environment variable ${key} appears to be a placeholder`)
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Clean up rate limit store periodically
 */
if (typeof window === 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key)
            }
        }
    }, 60000) // Clean up every minute
}
