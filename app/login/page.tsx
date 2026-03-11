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
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Neon stripe accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 opacity-80"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 blur-sm opacity-60"></div>

            {/* Ambient glow effects */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-cyan-500/30 relative z-10">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400">
                        📊 Crypto Portfolio Monitor
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Google Sign In Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-600 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/signup"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Don&apos;t have an account? Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
