'use client'

import AuthenticatedPage from '@/components/AuthenticatedPage'
import MonthlyOverview from '@/components/MonthlyOverview'

export default function MonthlyPage() {
  return (
    <AuthenticatedPage loadingLabel="Opening monthly overview">
      <MonthlyOverview />
    </AuthenticatedPage>
  )
}
