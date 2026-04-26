'use client'

import { useState, useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id?: string
  name: string
  description?: string
  category: string
  frequency: string
  customDays: number[]
  target: number
  color: string
  isActive: boolean
}

interface HabitFormProps {
  habit?: Habit | null
  onClose: () => void
  onSubmit: (habit: Habit) => void
}

export default function HabitForm({ habit, onClose, onSubmit }: HabitFormProps) {
  const [formData, setFormData] = useState<Habit>({
    name: '',
    description: '',
    category: 'other',
    frequency: 'daily',
    customDays: [],
    target: 1,
    color: '#6366f1',
    isActive: true,
  })

  const [showCustomDays, setShowCustomDays] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (habit) {
      setFormData(habit)
      setShowCustomDays(habit.frequency === 'custom')
    }
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = habit ? `/api/habits/${habit._id}` : '/api/habits'
    const method = habit ? 'PUT' : 'POST'

    try {
      setLoading(true)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        onSubmit(result)
      } else {
        console.error('Failed to save habit')
      }
    } catch (error) {
      console.error('Error saving habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFrequencyChange = (frequency: string) => {
    setFormData({ ...formData, frequency })
    setShowCustomDays(frequency === 'custom')
  }

  const handleCustomDayChange = (day: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        customDays: [...formData.customDays, day].sort()
      })
    } else {
      setFormData({
        ...formData,
        customDays: formData.customDays.filter(d => d !== day)
      })
    }
  }

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#22d3ee', '#a855f7', '#ec4899']
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="modal-header border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {habit ? 'Edit Habit' : 'Add New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="learning">Learning</option>
              <option value="productivity">Productivity</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="weekends">Weekends (Sat-Sun)</option>
              <option value="mon-wed-fri">Monday, Wednesday, Friday</option>
              <option value="tue-thu">Tuesday, Thursday</option>
              <option value="mon-sat">Monday to Saturday</option>
              <option value="custom">Custom Days</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {showCustomDays && (
            <div className="form-group mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days
              </label>
              <div className="flex flex-wrap gap-2">
                {days.map((day, index) => (
                  <label key={index} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={formData.customDays.includes(index)}
                      onChange={(e) => handleCustomDayChange(index, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target (per selected period)
            </label>
            <input
              type="number"
              min="1"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of times to complete this habit each time it's scheduled
            </p>
          </div>

          <div className="form-group mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <AppLoader variant="button" label={habit ? 'Updating' : 'Creating'} />
              ) : (
                `${habit ? 'Update' : 'Create'} Habit`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
