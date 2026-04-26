'use client'

import React, { useState, useEffect } from 'react'
import Select, { StylesConfig } from 'react-select'
import AppLoader from './AppLoader'

const frequencyOptions = [
  { value: 'daily', label: '📅 Daily' },
  { value: 'weekly', label: '📆 Weekly' },
  { value: 'weekdays', label: '💼 Weekdays (Mon-Fri)' },
  { value: 'weekends', label: '🌴 Weekends (Sat-Sun)' },
  { value: 'mon-wed-fri', label: '🔔 Monday, Wednesday, Friday' },
  { value: 'tue-thu', label: '📝 Tuesday, Thursday' },
  { value: 'mon-sat', label: '📋 Monday to Saturday' },
  { value: 'custom', label: '⚙️ Custom Days' },
  { value: 'monthly', label: '🗓️ Monthly' },
]

const categoryOptions = [
  { value: 'health', label: '❤️ Health' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'productivity', label: '🚀 Productivity' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'other', label: '📌 Other' },
]


const dayOptions = [
  { value: 1, label: '🌅 Monday' },
  { value: 2, label: '🌞 Tuesday' },
  { value: 3, label: '🌤️ Wednesday' },
  { value: 4, label: '⛅ Thursday' },
  { value: 5, label: '🌇 Friday' },
  { value: 6, label: '🌆 Saturday' },
  { value: 0, label: '🌙 Sunday' },
]

interface FormData {
  name: string
  description: string
  category: any
  frequency: any
  target: number
  customDays: readonly any[]
  monthlyTarget: number
}

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal?: any
  onSave: (goalData: any) => void
  loading?: boolean
  error?: string | null
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal, onSave, loading = false, error = null }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: null,
    frequency: null,
    target: 1,
    customDays: [],
    monthlyTarget: 22,
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        category: categoryOptions.find(opt => opt.value === goal.category) || null,
        frequency: frequencyOptions.find(opt => opt.value === goal.frequency) || null,
        target: goal.target || 1,
        customDays: goal.customDays
          ? dayOptions.filter(day => goal.customDays.includes(day.value))
          : [],
        monthlyTarget: goal.monthlyTarget || 22,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: null,
        frequency: null,
        target: 1,
        customDays: [],
        monthlyTarget: 22,
      })
    }
    setSubmitted(false)
    setValidationErrors([])
  }, [goal])

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('Goal name is required')
    } else if (formData.name.trim().length < 2) {
      errors.push('Goal name must be at least 2 characters long')
    } else if (formData.name.trim().length > 100) {
      errors.push('Goal name must be less than 100 characters')
    }

    if (!formData.category) {
      errors.push('Category is required')
    }

    if (!formData.frequency) {
      errors.push('Frequency is required')
    }

    if (formData.frequency?.value === 'custom' && (!formData.customDays || formData.customDays.length === 0)) {
      errors.push('Please select at least one day for custom frequency')
    }

    if (formData.target < 1 || formData.target > 100) {
      errors.push('Target must be between 1 and 100')
    }

    if (formData.monthlyTarget < 1 || formData.monthlyTarget > 31) {
      errors.push('Monthly target must be between 1 and 31')
    }

    if (formData.description && formData.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    const goalData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.value,
      frequency: formData.frequency.value,
      target: formData.target,
      customDays: formData.customDays.map(day => day.value),
      monthlyTarget: formData.monthlyTarget,
    }

    onSave(goalData)
  }

  const getFieldError = (field: 'name' | 'description' | 'category' | 'frequency' | 'target' | 'customDays' | 'monthlyTarget') => {
    if (!submitted) return ''

    const fieldErrorMap = {
      name: ['Goal name'],
      description: ['Description'],
      category: ['Category'],
      frequency: ['Frequency'],
      target: ['Target'],
      customDays: ['custom frequency'],
      monthlyTarget: ['Monthly target'],
    }

    return validationErrors.find(message =>
      fieldErrorMap[field].some(label => message.toLowerCase().includes(label.toLowerCase()))
    ) || ''
  }

  const fieldClass = (field: Parameters<typeof getFieldError>[0]) =>
    getFieldError(field)
      ? 'border-red-300 bg-red-50 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500'

  const handleFormChange = (nextFormData: FormData) => {
    setFormData(nextFormData)
    if (submitted) {
      setValidationErrors([])
      setSubmitted(false)
    }
  }

  const customStyles: StylesConfig<any, any> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
      borderWidth: '2px',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      backgroundColor: '#f9fafb',
      '&:hover': { borderColor: '#6366f1' },
      '&:focus-within': {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
      },
      transition: 'all 0.2s',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#6366f1'
        : state.isFocused
          ? '#f3f4f6'
          : 'white',
      color: state.isSelected ? 'white' : '#111827',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      margin: '0.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.75rem',
      padding: '0.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
      fontWeight: '500',
    }),
  }



  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {goal ? '✏️ Edit Goal' : '🎯 Add New Goal'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-none text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800">Please fix these details</h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {validationErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              placeholder="Enter your goal name..."
              value={formData.name}
              onChange={(e) => handleFormChange({ ...formData, name: e.target.value })}
              className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${fieldClass('name')}`}
            />
            {getFieldError('name') && (
              <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('name')}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe your goal..."
              value={formData.description}
              onChange={(e) => handleFormChange({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full resize-none rounded-xl border-2 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${fieldClass('description')}`}
            />
            {getFieldError('description') && (
              <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('description')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(category) => handleFormChange({ ...formData, category })}
                options={categoryOptions}
                styles={customStyles}
                placeholder="Select category..."
              />
              {getFieldError('category') && (
                <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('category')}</p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <Select
                value={formData.frequency}
                onChange={(frequency) => handleFormChange({ ...formData, frequency, customDays: frequency?.value === 'custom' ? formData.customDays : [] })}
                options={frequencyOptions}
                styles={customStyles}
                placeholder="Select frequency..."
              />
              {getFieldError('frequency') && (
                <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('frequency')}</p>
              )}
            </div>
          </div>

          {formData.frequency?.value === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Days *
              </label>
              <Select
                value={formData.customDays}
                onChange={(customDays) => handleFormChange({ ...formData, customDays })}
                options={dayOptions}
                styles={customStyles}
                placeholder="Select days..."
                isMulti
              />
              {getFieldError('customDays') && (
                <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('customDays')}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Target
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.target}
              onChange={(e) =>
                handleFormChange({
                  ...formData,
                  target: Number(e.target.value),
                })
              }
              className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${fieldClass('target')}`}
            />
            {getFieldError('target') && (
              <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('target')}</p>
            )}
          </div>

          {/* Monthly Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Target
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.monthlyTarget}
              onChange={(e) =>
                handleFormChange({
                  ...formData,
                  monthlyTarget: Number(e.target.value),
                })
              }
              className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${fieldClass('monthlyTarget')}`}
            />
            {getFieldError('monthlyTarget') && (
              <p className="mt-2 text-sm font-medium text-red-600">{getFieldError('monthlyTarget')}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <AppLoader variant="button" label={goal ? 'Updating' : 'Creating'} />
              ) : (
                <>{goal ? '🔄 Update Goal' : '🎯 Create Goal'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalModal
