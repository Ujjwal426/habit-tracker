'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AppLoader from '@/components/AppLoader'
import AuthShell from '@/components/AuthShell'

export default function SignUp() {
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="auth-bg min-h-screen bg-slate-950 px-4 py-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <AppLoader label="Checking your session" className="text-white" />
        </div>
      </div>
    )
  }

  // Don't render the signup form if user is authenticated
  if (status === 'authenticated') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        name: name.trim(),
        isSignUp: 'true',
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="signup" error={error} loading={loading}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <AppLoader variant="button" label="Signing up" /> : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
