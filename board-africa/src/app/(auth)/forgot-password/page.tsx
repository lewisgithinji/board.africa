'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for a password reset link.',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send reset email',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Reset your password
      </h2>

      <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form className="space-y-6" onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/90"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
