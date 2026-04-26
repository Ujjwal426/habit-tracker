'use client'

import { useState, useEffect } from 'react'
import HabitForm from './HabitForm'
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
  createdAt: string
  updatedAt: string
}

export default function HabitsList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    fetchHabits()
  }, [])

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        setActionLoading(true)
        const response = await fetch(`/api/habits/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setHabits(habits.filter(habit => habit._id !== id))
        }
      } catch (error) {
        console.error('Error deleting habit:', error)
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  const handleFormSubmit = (habitData: any) => {
    if (editingHabit) {
      setHabits(habits.map(h => h._id === editingHabit._id ? { ...h, ...habitData } : h))
    } else {
      setHabits([...habits, habitData])
    }
    handleFormClose()
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
    return <AppLoader label="Loading habits" />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Habits</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Habit
        </button>
      </div>

      {actionLoading && (
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <AppLoader variant="inline" label="Updating habits" />
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start building better habits by adding your first one!</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <i className={`fas ${getCategoryIcon(habit.category)} mr-2`} style={{ color: habit.color }}></i>
                  <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(habit._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              {habit.description && (
                <p className="text-gray-600 text-sm mb-2">{habit.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize">{habit.frequency}</span>
                <span>Target: {habit.target}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <HabitForm
          habit={editingHabit}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}
