'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    checkRateLimit,
    validateEmail,
    sanitizeErrorMessage,
    generateBrowserFingerprint
} from '@/lib/security'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [isRateLimited, setIsRateLimited] = useState(false)
    const [lockoutTime, setLockoutTime] = useState<number | null>(null)

    // Generate browser fingerprint for rate limiting
    const [fingerprint, setFingerprint] = useState<string>('')

    useEffect(() => {
        setFingerprint(generateBrowserFingerprint())
    }, [])

    useEffect(() => {
        if (lockoutTime && lockoutTime > Date.now()) {
            const timer = setInterval(() => {
                if (Date.now() >= lockoutTime) {
                    setIsRateLimited(false)
                    setLockoutTime(null)
                    setError(null)
                }
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [lockoutTime])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate inputs before processing
        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        // Validate email format
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        // Check rate limit
        const rateLimitCheck = checkRateLimit(`login:${fingerprint}`, 5, 15 * 60 * 1000)
        if (!rateLimitCheck.allowed) {
            setIsRateLimited(true)
            setLockoutTime(rateLimitCheck.resetTime)
            const remainingMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000)
            setError(`Too many login attempts. Please try again in ${remainingMinutes} minute(s).`)
            return
        }

        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            })

            if (error) throw error

            // Successful login - clear rate limit for this user
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            // Sanitize error message to prevent information leakage
            setError(sanitizeErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError(null)
        setGoogleLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            })

            if (error) throw error
        } catch (error: any) {
            setError(error.message || 'An error occurred during Google login')
            setGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to view your portfolio
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white/80 text-gray-500 font-medium">Or continue with email</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <Link
                                href="/signup"
                                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                            >
                                Don&apos;t have an account? <span className="text-blue-600">Sign up</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
