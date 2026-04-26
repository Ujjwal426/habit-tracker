'use client'

import AuthenticatedPage from '@/components/AuthenticatedPage'
import HabitCheckIn from '@/components/HabitCheckIn'

export default function DailyPage() {
  return (
    <AuthenticatedPage loadingLabel="Opening daily check-in">
      <HabitCheckIn />
    </AuthenticatedPage>
  )
}
