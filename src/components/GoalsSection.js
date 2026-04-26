import React from 'react';
import { getFrequencyLabel } from '../utils/habitUtils';

const GoalsSection = ({ goals, onAddGoal, onEditGoal, onDeleteGoal }) => {
  const getReadableTextColor = (hexColor) => {
    if (!hexColor) {
      return '#18231a';
    }

    const hex = hexColor.replace('#', '');
    const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 150 ? '#18231a' : '#ffffff';
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-bullseye text-xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Habits</h2>
              <p className="text-gray-500 text-sm">Track, analyze, and improve your routines</p>
            </div>
          </div>
          <button
            onClick={onAddGoal}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-black rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Habit
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-rocket text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Your Journey</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first habit, set a schedule like daily or Mon-Sat, and let the tracker handle streaks and analytics.</p>
          <button
            onClick={onAddGoal}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-black rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              style={{ borderLeft: `4px solid ${goal.color}` }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      ></span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {goal.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="w-8 h-8 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      title="Edit Habit"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      title="Delete Habit"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {goal.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <i className="fas fa-folder mr-1 text-xs"></i>
                    {goal.category}
                  </span>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: goal.color, color: getReadableTextColor(goal.color) }}
                  >
                    <i className="fas fa-clock mr-1 text-xs"></i>
                    {getFrequencyLabel(goal)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    <i className="fas fa-bullseye mr-1 text-xs"></i>
                    Goal {goal.monthlyTarget || 0}/month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
