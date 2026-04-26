'use client'

import { useState, useEffect } from 'react'
import GoalModal from './GoalModal'
import AppLoader from './AppLoader'
import DeleteHabitModal from './DeleteHabitModal'

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
  createdAt: string
  updatedAt: string
}

const categoryIcons: { [key: string]: string } = {
  health: '❤️',
  fitness: '💪',
  learning: '📚',
  productivity: '🚀',
  mindfulness: '🧘',
  other: '📌'
}

const frequencyLabels: { [key: string]: string } = {
  daily: '📅 Daily',
  weekly: '📆 Weekly',
  weekdays: '💼 Weekdays',
  weekends: '🌴 Weekends',
  'mon-wed-fri': '🔔 M-W-F',
  'tue-thu': '📝 T-Th',
  'mon-sat': '📋 Mon-Sat',
  custom: '⚙️ Custom',
  monthly: '🗓️ Monthly'
}

export default function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/habits')
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits')
      }
      
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      setError('Failed to load habits. Please try again.')
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHabit = async (habitData: any) => {
    try {
      setLoading(true)
      setError(null)

      console.log('habit data', JSON.stringify(habitData))
      
      const url = editingHabit ? `/api/habits/${editingHabit._id}` : '/api/habits'
      const method = editingHabit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save habit')
      }

      const savedHabit = await response.json()
      
      if (editingHabit) {
        setHabits(habits.map(h => h._id === savedHabit._id ? savedHabit : h))
        setSuccess('Habit updated successfully!')
      } else {
        setHabits([savedHabit, ...habits])
        setSuccess('Habit created successfully!')
      }

      setIsModalOpen(false)
      setEditingHabit(null)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save habit')
      console.error('Error saving habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
    setError(null)
  }

  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit)
    setError(null)
  }

  const handleCancelDelete = () => {
    if (deleteLoading) {
      return
    }

    setHabitToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!habitToDelete) {
      return
    }

    try {
      setDeleteLoading(true)
      setError(null)
      
      const response = await fetch(`/api/habits/${habitToDelete._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete habit')
      }

      setHabitToDelete(null)
      setSuccess('Habit deleted successfully!')
      await fetchHabits()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete habit')
      console.error('Error deleting habit:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
    setError(null)
  }

  if (loading && habits.length === 0) {
    return <AppLoader label="Loading habits" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Habits</h2>
          <p className="text-gray-600 mt-1">Track your daily habits and build consistency</p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null)
            setIsModalOpen(true)
            setError(null)
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Habit
        </button>
      </div>

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

      {loading && habits.length > 0 && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <AppLoader variant="inline" label="Saving changes" />
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start building better habits by creating your first one!</p>
          <button
            onClick={() => {
              setEditingHabit(null)
              setIsModalOpen(true)
              setError(null)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
                  </div>
                  
                  {habit.description && (
                    <p className="text-gray-600 mb-3">{habit.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {categoryIcons[habit.category]} {habit.category}
                    </span>
                    <span className="flex items-center gap-1">
                      {frequencyLabels[habit.frequency]} 
                    </span>
                    <span>Monthly Target: {habit.monthlyTarget}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditHabit(habit)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit habit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete habit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        goal={editingHabit}
        onSave={handleSaveHabit}
        loading={loading}
        error={error}
      />

      <DeleteHabitModal
        isOpen={Boolean(habitToDelete)}
        habit={habitToDelete}
        loading={deleteLoading}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
