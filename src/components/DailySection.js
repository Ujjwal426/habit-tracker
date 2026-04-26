import React, { useState } from 'react';
import {
  calculateHabitStats,
  formatDateKey,
  getDateRange,
  getFrequencyLabel,
  isHabitScheduledOnDate,
} from '../utils/habitUtils';

const DailySection = ({ goals, checkIns, onToggleHabit }) => {
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const selectedDateObj = new Date(selectedDate);
  const monthDates = getDateRange(
    new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1),
    new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() + 1, 0)
  );

  const todaysGoals = goals.filter((goal) => isHabitScheduledOnDate(goal, selectedDateObj));

  return (
    <div className="animate-fade-in">
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Daily Check-in</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="input-field w-auto"
          />
        </div>
      </div>

      <div className="card">
        {todaysGoals.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-calendar-day text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No habits scheduled for this day</h3>
            <p className="text-gray-500">Pick another date or create a new habit schedule.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {todaysGoals.map((goal) => {
              const isChecked = Boolean(checkIns[selectedDate]?.[goal.id]);
              const stats = calculateHabitStats(goal, checkIns, monthDates);
              const goalColor = goal.color || '#6366f1';

              return (
                <div
                  key={goal.id}
                  className="habit-item"
                  style={{ borderLeftColor: goalColor, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleHabit(goal.id, selectedDate)}
                      className="w-5 h-5 rounded focus:ring-2 focus:ring-offset-2 cursor-pointer"
                      style={{ accentColor: goalColor }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{goal.name}</div>
                      <span
                        className="category-badge text-xs"
                        style={{ backgroundColor: `${goalColor}20`, color: goalColor }}
                      >
                        {goal.category}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{getFrequencyLabel(goal)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Completed {stats.completedCount}/{stats.scheduledCount} scheduled days this month
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${stats.accuracy}%`,
                          backgroundColor: goalColor,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-right">
                      {stats.accuracy}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySection;
