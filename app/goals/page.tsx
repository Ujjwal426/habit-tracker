'use client'

import AuthenticatedPage from '@/components/AuthenticatedPage'
import HabitList from '@/components/HabitList'

export default function GoalsPage() {
  return (
    <AuthenticatedPage loadingLabel="Opening your goals">
      <HabitList />
    </AuthenticatedPage>
  )
}
