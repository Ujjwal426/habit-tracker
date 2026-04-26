'use client'

import { useEffect } from 'react'
import AppLoader from './AppLoader'

interface Habit {
  _id: string
  name: string
  description?: string
  category: string
  frequency: string
  target: number
  monthlyTarget?: number
  color: string
}

interface DeleteHabitModalProps {
  habit: Habit | null
  isOpen: boolean
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteHabitModal({
  habit,
  isOpen,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteHabitModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen || !habit) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-habit-title"
      onMouseDown={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative px-6 pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete habit modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Delete habit</p>
              <h2 id="delete-habit-title" className="mt-1 text-2xl font-bold text-gray-900">
                Remove "{habit.name}"?
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                This will permanently delete the habit and remove it from your habit list. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-6 mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: habit.color }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{habit.name}</p>
              <p className="mt-1 text-sm capitalize text-gray-500">
                {habit.category} - {habit.frequency} - Monthly target {habit.monthlyTarget}
              </p>
            </div>
          </div>

          {habit.description && (
            <p className="mt-3 line-clamp-2 text-sm text-gray-600">{habit.description}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep Habit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <AppLoader variant="button" label="Deleting" />
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                </svg>
                Delete Habit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
