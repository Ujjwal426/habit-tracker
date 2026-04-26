'use client'

import { useState, useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id: string
  name: string
  description: string
  category: string
  frequency: string
  customDays: number[]
  target: number
  monthlyTarget: number
  color: string
  isActive: boolean
}

interface CheckIn {
  _id: string
  habitId: string | { _id: string } | null
  date: string
  completed: boolean
  count: number
  notes: string
}

const categoryIcons: { [key: string]: string } = {
  health: '❤️',
  fitness: '💪',
  learning: '📚',
  productivity: '🚀',
  mindfulness: '🧘',
  other: '📌'
}

export default function HabitCheckIn() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dataLoading, setDataLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [counts, setCounts] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const loadCheckInData = async () => {
      setDataLoading(true)
      const fetchedHabits = await fetchHabits()
      await fetchCheckIns(fetchedHabits)
      setDataLoading(false)
    }

    loadCheckInData()
  }, [selectedDate])

  const fetchHabits = async () => {
    try {
      setError(null)
      const response = await fetch('/api/habits')
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits')
      }
      
      const data = await response.json()
      setHabits(data)
      
      // Initialize counts and notes
      const initialCounts: { [key: string]: number } = {}
      const initialNotes: { [key: string]: string } = {}
      data.forEach((habit: Habit) => {
        initialCounts[habit._id] = habit.target || 1
        initialNotes[habit._id] = ''
      })
      setCounts(initialCounts)
      setNotes(initialNotes)
      return data as Habit[]
    } catch (error) {
      setError('Failed to load habits. Please try again.')
      console.error('Error fetching habits:', error)
      return []
    }
  }

  const fetchCheckIns = async (habitsForCounts = habits) => {
    try {
      setError(null)
      // Fetch all check-ins for this habit to calculate progressive counts
      const response = await fetch(`/api/habits/checkin`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch check-ins')
      }
      
      const data = await response.json()
      setCheckIns(data)
      
      // Calculate progressive count for each habit
      const updatedCounts: { [key: string]: number } = {}
      const updatedNotes: { [key: string]: string } = {}
      
      for (const habit of habitsForCounts) {
        // Get all check-ins for this habit up to and including the selected date
        const habitCheckIns = data.filter((ci: CheckIn) => 
          ci.habitId === habit._id && 
          new Date(ci.date) <= new Date(selectedDate) &&
          ci.completed
        )
        
        // Get check-in for current date specifically
        const currentDayCheckIn = data.find((ci: CheckIn) => 
          ci.habitId === habit._id && ci.date === selectedDate
        )
        
        if (currentDayCheckIn && currentDayCheckIn.completed) {
          // If today is completed, the count is the number of completed days
          updatedCounts[habit._id] = habitCheckIns.length
        } else {
          // If today is not completed or no check-in, show what today would be
          updatedCounts[habit._id] = habitCheckIns.length + 1
        }
        
        // Get notes for current date
        updatedNotes[habit._id] = currentDayCheckIn?.notes || ''
      }
      
      setCounts(prev => ({ ...prev, ...updatedCounts }))
      setNotes(prev => ({ ...prev, ...updatedNotes }))
    } catch (error) {
      setError('Failed to load check-ins. Please try again.')
      console.error('Error fetching check-ins:', error)
    }
  }

  const handleCheckIn = async (habitId: string, completed: boolean) => {
    try {
      setLoading(true)
      setActiveHabitId(habitId)
      setError(null)
      
      const checkInData = {
        habitId,
        date: selectedDate,
        completed,
        count: counts[habitId] || 1,
        notes: notes[habitId] || ''
      }

      const response = await fetch('/api/habits/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkInData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check in')
      }

      const savedCheckIn = await response.json()
      
      // Update local state
      setCheckIns(prev => {
        // Remove existing check-in for this habit and date, then add the new one
        const filtered = prev.filter(ci => {
          const checkInHabitId = typeof ci.habitId === 'string' ? ci.habitId : 
                              (ci.habitId && typeof ci.habitId === 'object' ? ci.habitId._id : null)
          return !(checkInHabitId === habitId && ci.date === selectedDate)
        })
        return [...filtered, savedCheckIn]
      })

      setSuccess(completed ? 'Habit marked as completed! 🎉' : 'Habit marked as incomplete')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      
      // Refetch fresh data to ensure UI is up to date
      setTimeout(() => {
        fetchHabits().then(fetchedHabits => fetchCheckIns(fetchedHabits))
      }, 500)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check in')
      console.error('Error checking in:', error)
    } finally {
      setLoading(false)
      setActiveHabitId(null)
    }
  }

  const isHabitCompleted = (habitId: string) => {
    const checkIn = checkIns.find(ci => {
      // Handle different types of habitId
      if (typeof ci.habitId === 'string') {
        return ci.habitId === habitId
      } else if (ci.habitId && typeof ci.habitId === 'object' && ci.habitId._id) {
        return ci.habitId._id === habitId
      }
      return false
    })
    return checkIn?.completed || false
  }

  const getCompletionRate = () => {
    if (habits.length === 0) return 0
    const completed = checkIns.filter(ci => ci.completed).length
    return Math.round((completed / habits.length) * 100)
  }

  const completedCount = checkIns.filter(ci => ci.completed).length
  const remainingCount = Math.max(habits.length - completedCount, 0)
  const completionRate = getCompletionRate()
  const selectedDateObject = new Date(`${selectedDate}T00:00:00`)
  const selectedDateLabel = selectedDateObject.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const getEncouragement = () => {
    if (habits.length === 0) return 'Create your first habit and this page will become your daily check-in desk.'
    if (completionRate === 100) return 'Everything is checked off. That is a clean day.'
    if (completionRate >= 70) return 'You are close. One more small push can finish the day.'
    if (completionRate >= 40) return 'A steady day is forming. Keep the next habit simple.'
    return 'Start with the easiest habit. Momentum usually follows action.'
  }

  if (dataLoading) {
    return <AppLoader label="Loading daily check-in" />
  }

  return (
    <div className="space-y-6">
      <section className="daily-hero overflow-hidden rounded-lg border border-blue-100 bg-white">
        <div className="relative grid gap-6 p-5 lg:grid-cols-[1fr_280px] lg:items-center lg:p-6">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              {isToday ? "Today's Check-In" : 'Daily Check-In'}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">{selectedDateLabel}</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">{getEncouragement()}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold text-gray-700" htmlFor="daily-date">
                Change day
              </label>
              <input
                id="daily-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
              />
            </div>
          </div>

          <div className="relative z-10 rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Daily progress</p>
                <p className="mt-1 text-4xl font-bold text-blue-700">{completionRate}%</p>
              </div>
              <div className="daily-progress-ring" style={{ ['--progress' as string]: `${completionRate * 3.6}deg` }}>
                <div>{completedCount}/{habits.length}</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="daily-progress-fill h-full rounded-full bg-blue-600"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-green-50 px-3 py-2 text-green-800">
                <span className="font-bold">{completedCount}</span> complete
              </div>
              <div className="rounded-md bg-orange-50 px-3 py-2 text-orange-800">
                <span className="font-bold">{remainingCount}</span> left
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits to check in</h3>
          <p className="text-gray-600">Create some habits first to start tracking!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit, index) => {
            const isCompleted = isHabitCompleted(habit._id)
            return (
              <div
                key={habit._id}
                className={`daily-habit-row rounded-lg border p-5 transition-all ${
                  isCompleted 
                    ? 'border-green-300 bg-green-50 shadow-sm' 
                    : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
                }`}
                style={{ borderLeftColor: habit.color, borderLeftWidth: '4px', animationDelay: `${index * 70}ms` }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleCheckIn(habit._id, !isCompleted)}
                        disabled={loading}
                        className={`daily-check-button mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white text-transparent hover:border-blue-500 hover:text-blue-500'
                        }`}
                        aria-label={isCompleted ? `Mark ${habit.name} incomplete` : `Complete ${habit.name}`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-lg font-semibold ${
                            isCompleted ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {habit.name}
                          </h3>
                          {isCompleted && (
                            <span className="daily-complete-badge rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              Completed
                            </span>
                          )}
                        </div>
                        {habit.description && (
                          <p className="mt-1 text-sm text-gray-600">{habit.description}</p>
                        )}
                      </div>
                      <div
                        className="ml-auto h-3 w-3 flex-none rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 lg:ml-12">
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-medium capitalize">
                        {categoryIcons[habit.category]} {habit.category}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        Day {counts[habit._id] || 1}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                        Daily target {habit.target}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                        Monthly target {habit.monthlyTarget || 22}
                      </span>
                    </div>

                    <div className="mt-4 lg:ml-12">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Notes</label>
                        <textarea
                          value={notes[habit._id] || ''}
                          onChange={(e) => setNotes(prev => ({
                            ...prev,
                            [habit._id]: e.target.value
                          }))}
                          placeholder={isCompleted ? 'What helped today?' : 'Add a quick note before checking in...'}
                          rows={2}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                  </div>
                  
                  <div className="flex lg:w-36 lg:justify-end">
                    <button
                      onClick={() => handleCheckIn(habit._id, !isCompleted)}
                      disabled={loading}
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all lg:w-auto ${
                        isCompleted
                          ? 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
                          : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {activeHabitId === habit._id ? (
                        <AppLoader variant="button" label={isCompleted ? 'Updating' : 'Saving'} />
                      ) : (
                        isCompleted ? 'Undo' : 'Complete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
