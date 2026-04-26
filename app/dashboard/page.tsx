'use client'

import DashboardStats from '@/components/DashboardStats'
import AuthenticatedPage from '@/components/AuthenticatedPage'

export default function Dashboard() {
  return (
    <AuthenticatedPage loadingLabel="Opening your dashboard">
      <DashboardStats />
    </AuthenticatedPage>
  )
}
