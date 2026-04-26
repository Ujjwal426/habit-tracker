import React, { useMemo, useState } from 'react';
import {
  formatDateKey,
  getHabitDayStatus,
  getMonthDates,
  getMonthSummary,
} from '../utils/habitUtils';

const MonthlySection = ({ goals, checkIns }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthDates = useMemo(
    () => getMonthDates(selectedYear, selectedMonth),
    [selectedMonth, selectedYear]
  );

  const dailyOverview = useMemo(() => (
    monthDates.map((date) => {
      const dateKey = formatDateKey(date);
      const scheduledHabits = goals.filter((goal) => getHabitDayStatus(goal, checkIns, dateKey) !== 'not-scheduled');
      const completedHabits = scheduledHabits.filter((goal) => checkIns[dateKey]?.[goal.id]).length;
      return { date, dateKey, scheduledHabits: scheduledHabits.length, completedHabits };
    })
  ), [checkIns, goals, monthDates]);

  return (
    <div className="animate-fade-in">
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Monthly Overview</h2>
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(parseInt(event.target.value, 10))}
              className="input-field w-auto"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(parseInt(event.target.value, 10))}
              className="input-field w-auto"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const year = new Date().getFullYear() - 2 + index;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          {months[selectedMonth]} {selectedYear}
        </h3>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: monthDates[0]?.getDay() || 0 }, (_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
          {dailyOverview.map(({ date, dateKey, scheduledHabits, completedHabits }) => {
            const isToday = formatDateKey(new Date()) === dateKey;
            const ratio = scheduledHabits ? completedHabits / scheduledHabits : 0;
            let dayClasses = 'aspect-square flex flex-col items-center justify-center border border-gray-200 rounded-lg relative';

            if (isToday) {
              dayClasses += ' bg-primary-100 border-primary-500';
            } else if (scheduledHabits && ratio === 1) {
              dayClasses += ' bg-green-100 border-green-500';
            } else if (scheduledHabits && ratio > 0) {
              dayClasses += ' bg-amber-100 border-amber-500';
            }

            return (
              <div key={dateKey} className={dayClasses}>
                <div className="text-sm font-medium">{date.getDate()}</div>
                <div className="text-xs mt-1">{scheduledHabits ? `${completedHabits}/${scheduledHabits}` : '-'}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-300 rounded"></div>
            <span className="text-gray-600">Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-500 rounded"></div>
            <span className="text-gray-600">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-100 border border-primary-500 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-4">Habit</th>
                <th className="p-4">Goal</th>
                <th className="p-4">Completed</th>
                <th className="p-4">Scheduled</th>
                <th className="p-4">Accuracy</th>
                {monthDates.map((date) => (
                  <th key={formatDateKey(date)} className="p-2 text-center">{date.getDate()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => {
                const summary = getMonthSummary(goal, checkIns, selectedYear, selectedMonth);
                return (
                  <tr key={goal.id} className="border-t border-gray-100">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{goal.name}</div>
                      <div className="text-xs text-gray-500">{goal.category}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{goal.monthlyTarget || 0}/month</td>
                    <td className="p-4 text-sm text-gray-600">{summary.completedCount}</td>
                    <td className="p-4 text-sm text-gray-600">{summary.scheduledCount}</td>
                    <td className="p-4 text-sm text-gray-600">{summary.accuracy}%</td>
                    {monthDates.map((date) => {
                      const status = getHabitDayStatus(goal, checkIns, formatDateKey(date));
                      const backgroundColor =
                        status === 'completed' ? '#10b981' :
                        status === 'missed' ? '#fee2e2' :
                        '#f3f4f6';
                      const color =
                        status === 'completed' ? 'white' :
                        status === 'missed' ? '#b91c1c' :
                        '#9ca3af';

                      return (
                        <td key={`${goal.id}-${formatDateKey(date)}`} className="p-2">
                          <div
                            className="rounded-lg text-center text-xs font-semibold"
                            style={{ backgroundColor, color, padding: '0.35rem 0.5rem' }}
                            title={`${goal.name} on ${formatDateKey(date)}`}
                          >
                            {status === 'completed' ? '✓' : status === 'missed' ? '•' : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySection;
