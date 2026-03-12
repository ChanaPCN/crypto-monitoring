'use client'

import { useEffect, useState } from 'react'

interface PasswordRequirementsProps {
    password: string
    className?: string
}

interface Requirement {
    label: string
    test: (password: string) => boolean
}

const requirements: Requirement[] = [
    {
        label: 'At least 8 characters',
        test: (password) => password.length >= 8,
    },
    {
        label: 'One uppercase letter',
        test: (password) => /[A-Z]/.test(password),
    },
    {
        label: 'One lowercase letter',
        test: (password) => /[a-z]/.test(password),
    },
    {
        label: 'One number',
        test: (password) => /[0-9]/.test(password),
    },
    {
        label: 'One special character',
        test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
]

export default function PasswordRequirements({ password, className = '' }: PasswordRequirementsProps) {
    const [checks, setChecks] = useState<boolean[]>(requirements.map(() => false))

    useEffect(() => {
        const newChecks = requirements.map((req) => req.test(password))
        setChecks(newChecks)
    }, [password])

    // Don't show until user starts typing
    if (!password) return null

    const allMet = checks.every((check) => check)

    return (
        <div className={`bg-gray-50/50 rounded-xl p-4 space-y-2 ${className}`}>
            <div className="text-xs font-semibold text-gray-600 mb-2 tracking-tight">Password requirements:</div>
            <div className="space-y-1.5">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                            className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all ${checks[index]
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-200 text-gray-400'
                                }`}
                        >
                            {checks[index] ? '✓' : '○'}
                        </div>
                        <span
                            className={`transition-colors ${checks[index] ? 'text-green-700 font-medium' : 'text-gray-500'
                                }`}
                        >
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
            {allMet && (
                <div className="flex items-center gap-2 text-xs text-green-700 pt-1 mt-2 border-t border-green-100">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        ✓
                    </div>
                    <span className="font-semibold">Password meets all requirements</span>
                </div>
            )}
        </div>
    )
}
