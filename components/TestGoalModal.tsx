'use client'

import { useState } from 'react'
import GoalModal from './GoalModal'

export default function TestGoalModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [goals, setGoals] = useState<any[]>([])

  const handleSaveGoal = (goalData: any) => {
    console.log('Saving goal:', goalData)
    setGoals([...goals, { ...goalData, id: Date.now().toString() }])
    setIsModalOpen(false)
  }

  const handleEditGoal = (goal: any) => {
    console.log('Editing goal:', goal)
    // For demo purposes, we'll just open the modal with the goal data
    // In a real app, you'd handle this differently
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Goal Modal Demo</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Your Goals</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              + Add New Goal
            </button>
          </div>
          
          {goals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No goals yet. Create your first goal!</p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.category} • {goal.frequency}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoal}
        />
      </div>
    </div>
  )
}
