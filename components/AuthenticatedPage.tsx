'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AppLoader from '@/components/AppLoader'

interface AuthenticatedPageProps {
  children: React.ReactNode
  loadingLabel?: string
}

export default function AuthenticatedPage({
  children,
  loadingLabel = 'Opening your page',
}: AuthenticatedPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <AppLoader variant="page" label={loadingLabel} />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          {children}
        </div>
      </main>
    </div>
  )
}
