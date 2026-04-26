'use client'

import { useState, useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id: string
  name: string
  description?: string
  category: string
  frequency: string
  customDays: number[]
  target: number
  color: string
  isActive: boolean
}

interface CheckIn {
  _id: string
  habitId: Habit
  date: string
  completed: boolean
  count: number
  notes?: string
}

export default function DailyCheckIn() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [savingHabitId, setSavingHabitId] = useState<string | null>(null)

  useEffect(() => {
    fetchHabits()
    fetchCheckIns()
  }, [selectedDate])

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckIns = async () => {
    try {
      const response = await fetch(`/api/habits/checkin?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setCheckIns(data)
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    }
  }

  const handleCheckIn = async (habitId: string, completed: boolean, count: number = 0) => {
    try {
      setSavingHabitId(habitId)
      const response = await fetch('/api/habits/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitId,
          date: selectedDate,
          completed,
          count,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCheckIns(prev => 
          prev.map(ci => ci.habitId._id === habitId ? result : ci) ||
          (prev.some(ci => ci.habitId._id === habitId) ? prev : [...prev, result])
        )
      }
    } catch (error) {
      console.error('Error checking in:', error)
    } finally {
      setSavingHabitId(null)
    }
  }

  const getCheckInForHabit = (habitId: string) => {
    return checkIns.find(ci => ci.habitId._id === habitId)
  }

  const isHabitScheduledForToday = (habit: Habit) => {
    const today = new Date().getDay()
    const dayIndex = today === 0 ? 6 : today - 1

    switch (habit.frequency) {
      case 'daily':
        return true
      case 'weekdays':
        return dayIndex >= 0 && dayIndex <= 4
      case 'weekends':
        return dayIndex === 5 || dayIndex === 6
      case 'mon-wed-fri':
        return dayIndex === 0 || dayIndex === 2 || dayIndex === 4
      case 'tue-thu':
        return dayIndex === 1 || dayIndex === 3
      case 'mon-sat':
        return dayIndex >= 0 && dayIndex <= 5
      case 'custom':
        return habit.customDays.includes(dayIndex)
      case 'weekly':
        return dayIndex === 0
      case 'monthly':
        return new Date().getDate() === 1
      default:
        return false
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      health: 'fa-heart',
      fitness: 'fa-dumbbell',
      learning: 'fa-book',
      productivity: 'fa-briefcase',
      mindfulness: 'fa-spa',
      other: 'fa-star'
    }
    return icons[category] || 'fa-star'
  }

  if (loading) {
    return <AppLoader label="Loading daily check-ins" />
  }

  const todayHabits = habits.filter(isHabitScheduledForToday)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Check-in</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Date:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {todayHabits.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-calendar-check text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits scheduled for today</h3>
          <p className="text-gray-600">Take a break or add more habits to track!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayHabits.map((habit) => {
            const checkIn = getCheckInForHabit(habit._id)
            const isCompleted = checkIn?.completed || false
            const currentCount = checkIn?.count || 0

            return (
              <div
                key={habit._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i
                      className={`fas ${getCategoryIcon(habit.category)} text-lg`}
                      style={{ color: habit.color }}
                    ></i>
                    <div>
                      <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Target: {habit.target}
                        </span>
                        {isCompleted && (
                          <span className="text-sm text-green-600 font-medium">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {habit.target > 1 && (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Count:</label>
                        <input
                          type="number"
                          min="0"
                          max={habit.target}
                          value={currentCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 0
                            handleCheckIn(habit._id, count >= habit.target, count)
                          }}
                          disabled={savingHabitId === habit._id}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-500">/ {habit.target}</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const newCount = habit.target === 1 ? 1 : Math.min(currentCount + 1, habit.target)
                        handleCheckIn(habit._id, newCount >= habit.target, newCount)
                      }}
                      disabled={savingHabitId === habit._id}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isCompleted
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      {savingHabitId === habit._id ? (
                        <AppLoader variant="button" label="Saving" />
                      ) : isCompleted ? (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Done
                        </>
                      ) : (
                        <>
                          <i className="fas fa-circle mr-2"></i>
                          Check In
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {checkIn?.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Notes:</strong> {checkIn.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Today's Progress</h3>
        <div className="text-sm text-blue-800">
          {todayHabits.length > 0 && (
            <>
              <p>
                Completed: {checkIns.filter(ci => ci.completed).length} / {todayHabits.length} habits
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(checkIns.filter(ci => ci.completed).length / todayHabits.length) * 100}%`
                  }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
