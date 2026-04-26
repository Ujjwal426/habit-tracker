'use client'

import { useState, useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id: string
  name: string
  color: string
  monthlyTarget?: number
}

interface CheckIn {
  habitId: Habit | string | null
  date: string
  completed: boolean
  count: number
}

export default function DashboardStats() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
    fetchStats()
  }, [period])

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getCheckInHabitId = (checkIn: CheckIn) => {
    if (typeof checkIn.habitId === 'string') return checkIn.habitId
    if (checkIn.habitId && checkIn.habitId._id) return checkIn.habitId._id
    return null
  }

  const getPeriodLabel = () => {
    if (period === 'week') return 'Last 7 days'
    if (period === 'month') return 'Last 30 days'
    return 'Last 12 months'
  }

  const getPeriodDays = () => {
    if (period === 'week') return 7
    if (period === 'month') return 30
    return 365
  }

  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - (getPeriodDays() - 1))

    const dates: string[] = []
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(formatDateKey(date))
    }

    return dates
  }

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 6)
      } else if (period === 'month') {
        startDate.setDate(endDate.getDate() - 29)
      } else {
        startDate.setDate(endDate.getDate() - 364)
      }

      const promises = []
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = formatDateKey(date)
        promises.push(fetch(`/api/habits/checkin?date=${dateStr}`))
      }
      
      const responses = await Promise.all(promises)
      const allCheckIns: CheckIn[] = []
      
      for (const response of responses) {
        if (response.ok) {
          const data = await response.json()
          allCheckIns.push(...data)
        }
      }
      
      setCheckIns(allCheckIns)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCurrentStreak = () => {
    if (checkIns.length === 0) return 0
    
    const sortedDates = Array.from(new Set(checkIns.map(ci => 
      formatDateKey(new Date(ci.date))
    ))).sort().reverse()
    
    let streak = 0
    const today = formatDateKey(new Date())
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i]
      const dateObj = new Date(date)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (date === formatDateKey(expectedDate)) {
        const dayCheckIns = checkIns.filter(ci => 
          formatDateKey(new Date(ci.date)) === date
        )
        if (dayCheckIns.some(ci => ci.completed)) {
          streak++
        } else {
          break
        }
      } else {
        break
      }
    }
    
    return streak
  }

  const calculateBestStreak = () => {
    if (checkIns.length === 0) return 0
    
    const sortedDates = Array.from(new Set(checkIns.map(ci => 
      formatDateKey(new Date(ci.date))
    ))).sort()
    
    let bestStreak = 0
    let currentStreak = 0
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i]
      const dayCheckIns = checkIns.filter(ci => 
        formatDateKey(new Date(ci.date)) === date
      )
      
      if (dayCheckIns.some(ci => ci.completed)) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    return bestStreak
  }

  const calculateCompletionRate = () => {
    if (habits.length === 0) return 0
    
    const totalPossible = habits.length * getDateRange().length
    const completed = checkIns.filter(ci => ci.completed).length
    
    return Math.round((completed / totalPossible) * 100)
  }

  const getTotalCompleted = () => {
    return checkIns.filter(ci => ci.completed).length
  }

  const getChartData = () => {
    const dailyData: { [key: string]: number } = Object.fromEntries(
      getDateRange().map(date => [date, 0])
    )
    
    checkIns.forEach(ci => {
      const date = formatDateKey(new Date(ci.date))
      if (!dailyData[date]) {
        dailyData[date] = 0
      }
      if (ci.completed) {
        dailyData[date]++
      }
    })
    
    return Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(period === 'year' ? -60 : -30)
  }

  const getHabitPerformance = () => {
    const habitStats: { [key: string]: { name: string; completed: number; total: number; color: string } } = {}
    
    habits.forEach(habit => {
      habitStats[habit._id] = {
        name: habit.name,
        completed: 0,
        total: 0,
        color: habit.color
      }
    })
    
    checkIns.forEach(ci => {
      const habitId = getCheckInHabitId(ci)
      
      if (habitId && habitStats[habitId]) {
        habitStats[habitId].total++
        if (ci.completed) {
          habitStats[habitId].completed++
        }
      }
    })
    
    return Object.values(habitStats)
      .filter(stat => stat.total > 0)
      .map(stat => ({
        ...stat,
        completionRate: Math.round((stat.completed / stat.total) * 100)
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
  }

  const getStrongDays = () => {
    if (habits.length === 0) return 0

    return getChartData().filter(day => day.count === habits.length).length
  }

  const getAveragePerDay = () => {
    const days = getDateRange().length
    if (days === 0) return 0
    return Math.round((getTotalCompleted() / days) * 10) / 10
  }

  const getTopHabit = () => {
    const performance = getHabitPerformance()
    return performance.length > 0 ? performance[0] : null
  }

  if (loading) {
    return <AppLoader label="Loading dashboard insights" />
  }

  const chartData = getChartData()
  const habitPerformance = getHabitPerformance()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Dashboard</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{getPeriodLabel()}</h2>
          <p className="mt-1 text-sm text-gray-600">
            A quick read on streaks, completion rate, and habit performance.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                period === p
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-orange-700">Current streak</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-950">{calculateCurrentStreak()} days</h3>
          <p className="mt-1 text-xs text-orange-800">Consecutive days with at least one completed habit</p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700">Completion rate</p>
          <h3 className="mt-2 text-3xl font-bold text-green-950">{calculateCompletionRate()}%</h3>
          <p className="mt-1 text-xs text-green-800">{getTotalCompleted()} completed check-ins in this period</p>
        </div>

        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-indigo-700">Best streak</p>
          <h3 className="mt-2 text-3xl font-bold text-indigo-950">{calculateBestStreak()} days</h3>
          <p className="mt-1 text-xs text-indigo-800">Longest run inside the selected period</p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Average per day</p>
          <h3 className="mt-2 text-3xl font-bold text-blue-950">{getAveragePerDay()}</h3>
          <p className="mt-1 text-xs text-blue-800">Completed habits per calendar day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
              <p className="text-sm text-gray-600">Bars show how many habits were completed each day.</p>
            </div>
            <p className="text-sm font-medium text-gray-700">{getStrongDays()} perfect days</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <div className="flex h-full items-end justify-between gap-1 border-b border-l border-gray-200 px-1 pb-1">
                {chartData.map((item, index) => (
                  <div key={index} className="flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-blue-500 transition-colors hover:bg-blue-700"
                      style={{
                        height: `${Math.max((item.count / Math.max(habits.length, 1)) * 100, item.count > 0 ? 8 : 2)}%`
                      }}
                      title={`${item.date}: ${item.count} of ${habits.length} habits completed`}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{chartData[0]?.date}</span>
                <span>{chartData[chartData.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-500">
              No data available for the selected period
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Snapshot</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-500">Top habit</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{getTopHabit()?.name || 'No data yet'}</p>
              <p className="text-sm text-gray-600">{getTopHabit() ? `${getTopHabit()?.completionRate}% completion` : 'Complete a habit to see a leader.'}</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-500">Total habits</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{habits.length}</p>
              <p className="text-sm text-gray-600">Habits included in these stats</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{getTotalCompleted()}</p>
              <p className="text-sm text-gray-600">Finished check-ins in {getPeriodLabel().toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Habit Performance</h3>
          <p className="text-sm text-gray-600">Sorted from strongest to weakest for the selected period.</p>
        </div>
          {habitPerformance.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {habitPerformance.map((habit, index) => (
                <div key={index} className="rounded-md border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 flex-none rounded-full"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-900">{habit.name}</span>
                      <span className="text-sm font-semibold text-gray-700">{habit.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${habit.completionRate}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{habit.completed} of {habit.total} recorded check-ins completed</p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md bg-gray-50 text-gray-500">
              No habit performance data available
            </div>
          )}
      </div>
    </div>
  )
}
