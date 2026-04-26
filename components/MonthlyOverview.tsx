'use client'

import { useState, useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id: string
  name: string
  color: string
  frequency: string
  customDays: number[]
}

interface CheckIn {
  habitId: Habit | string | null
  date: string
  completed: boolean
  count: number
}

export default function MonthlyOverview() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    fetchHabits()
  }, [])

  useEffect(() => {
    fetchMonthlyData()
  }, [selectedMonth, selectedYear])

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const shouldShowHabitOnDate = (habit: Habit, date: Date) => {
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    switch (habit.frequency) {
      case 'daily':
        return true
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6 // Sunday and Saturday
      case 'mon-wed-fri':
        return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 // Monday, Wednesday, Friday
      case 'tue-thu':
        return dayOfWeek === 2 || dayOfWeek === 4 // Tuesday, Thursday
      case 'mon-sat':
        return dayOfWeek >= 1 && dayOfWeek <= 6 // Monday to Saturday
      case 'custom':
        return habit.customDays.includes(dayOfWeek)
      default:
        return true
    }
  }

  const fetchHabits = async () => {
    try {
      setLoading(true)
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

  const fetchMonthlyData = async () => {
    try {
      setLoading(true)
      const startDate = new Date(selectedYear, selectedMonth, 1)
      const endDate = new Date(selectedYear, selectedMonth + 1, 0)
      
      const response = await fetch(
        `/api/habits/checkin?startDate=${formatDateKey(startDate)}&endDate=${formatDateKey(endDate)}`
      )

      if (response.ok) {
        const data = await response.json()
        setCheckIns(data)
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }

  const getFirstDayOfMonth = () => {
    return new Date(selectedYear, selectedMonth, 1).getDay()
  }

  const getCheckInForDate = (date: number, habitId: string) => {
    const dateStr = formatDateKey(new Date(selectedYear, selectedMonth, date))
    return checkIns.find(ci => {
      // Handle different types of habitId
      let checkInHabitId: string | null = null
      
      if (typeof ci.habitId === 'string') {
        checkInHabitId = ci.habitId
      } else if (ci.habitId && ci.habitId._id) {
        checkInHabitId = ci.habitId._id
      }
      
      return checkInHabitId === habitId && 
             formatDateKey(new Date(ci.date)) === dateStr
    })
  }

  const getCompletedCount = () => {
    let completedCount = 0
    let totalPossible = 0
    
    for (let day = 1; day <= getDaysInMonth(); day++) {
      const date = new Date(selectedYear, selectedMonth, day)
      const habitsForDay = habits.filter(habit => shouldShowHabitOnDate(habit, date))
      
      totalPossible += habitsForDay.length
      
      for (const habit of habitsForDay) {
        const checkIn = getCheckInForDate(day, habit._id)
        if (checkIn && checkIn.completed) {
          completedCount++
        }
      }
    }
    
    return { completedCount, totalPossible }
  }

  const getCompletionRate = () => {
    if (habits.length === 0) return 0
    const { completedCount, totalPossible } = getCompletedCount()
    return totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0
  }

  const getDailyCompletedCount = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day)
    const habitsForDay = habits.filter(habit => shouldShowHabitOnDate(habit, date))
    return habitsForDay.filter(habit => getCheckInForDate(day, habit._id)?.completed).length
  }

  const getBestDay = () => {
    if (habits.length === 0) return null

    let bestDay = 1
    let bestCount = 0

    for (let day = 1; day <= getDaysInMonth(); day++) {
      const date = new Date(selectedYear, selectedMonth, day)
      const habitsForDay = habits.filter(habit => shouldShowHabitOnDate(habit, date))
      const completed = habitsForDay.filter(habit => getCheckInForDate(day, habit._id)?.completed).length
      
      if (completed > bestCount) {
        bestDay = day
        bestCount = completed
      }
    }

    return { day: bestDay, count: bestCount }
  }

  const getHabitCompletion = (habitId: string) => {
    let completed = 0

    for (let day = 1; day <= getDaysInMonth(); day++) {
      if (getCheckInForDate(day, habitId)?.completed) {
        completed++
      }
    }

    return completed
  }

  const getHabitScheduledCompletion = (habitId: string) => {
    let completed = 0
    let scheduled = 0
    
    for (let day = 1; day <= getDaysInMonth(); day++) {
      const date = new Date(selectedYear, selectedMonth, day)
      const habit = habits.find(h => h._id === habitId)
      
      if (habit && shouldShowHabitOnDate(habit, date)) {
        scheduled++
        if (getCheckInForDate(day, habitId)?.completed) {
          completed++
        }
      }
    }
    
    return `${completed}/${scheduled}`
  }

  const getInsightText = () => {
    const rate = getCompletionRate()
    if (rate >= 80) return 'Excellent month. Your routine is holding strong.'
    if (rate >= 60) return 'Good progress. A few more steady days will lift the month.'
    if (rate >= 40) return 'You have momentum. Focus on one reliable habit first.'
    return 'A fresh start is still useful. Pick the easiest habit and mark today.'
  }

  if (loading) {
    return <AppLoader label="Loading monthly overview" />
  }

  const daysInMonth = getDaysInMonth()
  const firstDay = getFirstDayOfMonth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Monthly Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {months[selectedMonth]} {selectedYear}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            See which habits were completed on each day of the month.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Habits tracked</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{habits.length}</p>
          <p className="mt-1 text-xs text-gray-500">Active habits in this account</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-green-700">Completion rate</p>
          <p className="mt-2 text-3xl font-bold text-green-800">{getCompletionRate()}%</p>
          <p className="mt-1 text-xs text-green-700">{getCompletedCount().completedCount} of {getCompletedCount().totalPossible} possible check-ins</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Best day</p>
          <p className="mt-2 text-3xl font-bold text-blue-800">
            {getBestDay() ? `${getBestDay()?.count}` : '0'}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            {getBestDay() ? `${months[selectedMonth]} ${getBestDay()?.day}` : 'No completed habits yet'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Days in month</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{daysInMonth}</p>
          <p className="mt-1 text-xs text-gray-500">Calendar days shown below</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Month Calendar</h3>
            <p className="text-sm text-gray-600">Darker days mean more habits completed.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <span className="h-4 w-4 rounded border border-gray-200 bg-gray-50"></span>
            <span className="h-4 w-4 rounded border border-green-200 bg-green-100"></span>
            <span className="h-4 w-4 rounded border border-green-300 bg-green-300"></span>
            <span className="h-4 w-4 rounded border border-green-500 bg-green-600"></span>
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold uppercase text-gray-500">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }, (_, index) => (
            <div key={`blank-${index}`} className="aspect-square rounded-md bg-gray-50"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const date = new Date(selectedYear, selectedMonth, day)
            const habitsForDay = habits.filter(habit => shouldShowHabitOnDate(habit, date))
            const completed = getDailyCompletedCount(day)
            const rate = habitsForDay.length === 0 ? 0 : completed / habitsForDay.length
            const tone =
              rate === 0 ? 'border-gray-200 bg-gray-50 text-gray-500' :
              rate < 0.34 ? 'border-green-200 bg-green-100 text-green-800' :
              rate < 0.67 ? 'border-green-300 bg-green-300 text-green-950' :
              'border-green-600 bg-green-600 text-white'

            return (
              <div
                key={day}
                title={`${months[selectedMonth]} ${day}: ${completed} of ${habitsForDay.length} habits completed`}
                className={`aspect-square rounded-md border p-1 ${tone}`}
              >
                <div className="text-xs font-semibold">{day}</div>
                <div className="mt-1 text-center text-xs font-bold sm:text-sm">
                  {completed}/{habitsForDay.length}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No habits to track</h3>
          <p className="mt-1 text-gray-600">Add habits first, then this month view will show progress.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Habit Breakdown</h3>
            <p className="text-sm text-gray-600">Each row is one habit. Filled cells are completed days.</p>
          </div>

        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid items-center gap-1" style={{ gridTemplateColumns: `180px repeat(${daysInMonth}, minmax(22px, 1fr)) 64px` }}>
              <div className="sticky left-0 z-10 bg-white text-sm font-semibold text-gray-700">Habit</div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500">
                  {day}
                </div>
              ))}
              <div className="text-right text-xs font-semibold text-gray-500">Done</div>
            </div>

            {habits.map((habit) => (
              <div
                key={habit._id}
                className="mt-2 grid items-center gap-1 rounded-md border border-gray-100 py-2"
                style={{ gridTemplateColumns: `180px repeat(${daysInMonth}, minmax(22px, 1fr)) 64px` }}
              >
                <div className="sticky left-0 z-10 flex items-center bg-white px-2 text-sm font-medium text-gray-900">
                  <div
                    className="mr-2 h-3 w-3 flex-none rounded-full"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="truncate">{habit.name}</span>
                </div>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const date = new Date(selectedYear, selectedMonth, day)
                  const shouldShow = shouldShowHabitOnDate(habit, date)
                  
                  if (!shouldShow) {
                    return (
                      <div
                        key={day}
                        className="h-6"
                      />
                    )
                  }
                  
                  const checkIn = getCheckInForDate(day, habit._id)
                  const isCompleted = checkIn?.completed || false
                  
                  return (
                    <div
                      key={day}
                      className={`h-6 rounded text-center text-xs leading-6 ${
                        isCompleted
                          ? 'border border-green-500 bg-green-500 text-white'
                          : 'border border-gray-200 bg-gray-50 text-gray-300'
                      }`}
                      title={`${habit.name} - ${months[selectedMonth]} ${day}${isCompleted ? ' completed' : ' not completed'}`}
                    >
                      {isCompleted ? '✓' : ''}
                    </div>
                  )
                })}
                <div className="pr-2 text-right text-sm font-semibold text-gray-700">
                  {getHabitScheduledCompletion(habit._id)}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-950">What this means</h3>
        <p className="mt-1 text-sm text-blue-900">
          You completed {getCompletedCount().completedCount} out of {getCompletedCount().totalPossible} possible habit check-ins this month. {getInsightText()}
        </p>
      </div>
    </div>
  )
}
