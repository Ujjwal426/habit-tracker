'use client'

import Link from 'next/link'
import AppLoader from '@/components/AppLoader'
import ThemeToggle from '@/components/ThemeToggle'

interface AuthShellProps {
  mode: 'signin' | 'signup'
  error: string
  loading: boolean
  children: React.ReactNode
}

export default function AuthShell({ mode, error, loading, children }: AuthShellProps) {
  const isSignIn = mode === 'signin'

  return (
    <div className="auth-bg min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden bg-slate-950 p-10 text-white lg:block">
            <div className="auth-grid absolute inset-0 opacity-40"></div>
            <div className="relative flex h-full flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-slate-950">H</span>
                Habit Tracker
              </Link>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  Stay consistent
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-tight">
                  Small daily wins, made easy to see.
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  Track goals, review progress, and keep your routine honest without a noisy interface getting in the way.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-bold text-emerald-300">7d</p>
                  <p className="mt-1 text-slate-300">streak view</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-bold text-sky-300">30</p>
                  <p className="mt-1 text-slate-300">day insights</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-bold text-amber-300">1x</p>
                  <p className="mt-1 text-slate-300">daily check-in</p>
                </div>
              </div>
            </div>
          </section>

          <main className="bg-white px-5 py-8 text-slate-950 dark:bg-slate-900 dark:text-slate-100 sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold text-slate-950 dark:text-slate-100">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-slate-950">H</span>
                  Habit Tracker
                </Link>
                <ThemeToggle />
              </div>

              <div className="mb-8 hidden justify-end lg:flex">
                <ThemeToggle />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  {isSignIn ? 'Welcome back' : 'Start tracking'}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {isSignIn ? 'Log in to your account' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {isSignIn
                    ? 'Pick up where your routine left off.'
                    : 'Set up your space and begin with your first habit.'}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
                <Link
                  href="/auth/signin"
                  className={`rounded-md px-4 py-2 text-center transition ${
                    isSignIn ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className={`rounded-md px-4 py-2 text-center transition ${
                    !isSignIn ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Signup
                </Link>
              </div>

              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6">{children}</div>

              <p className="mt-6 text-center text-sm text-slate-600">
                {isSignIn ? 'New here?' : 'Already have an account?'}{' '}
                <Link
                  href={isSignIn ? '/auth/signup' : '/auth/signin'}
                  className="font-semibold text-blue-700 hover:text-blue-800"
                >
                  {isSignIn ? 'Create an account' : 'Log in'}
                </Link>
              </p>

              {loading && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <AppLoader variant="inline" label={isSignIn ? 'Logging in' : 'Creating account'} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
