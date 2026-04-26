import React, { useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  calculateHabitStats,
  formatDateKey,
  getBestAndWorstHabits,
  getDatesForPeriod,
  getHabitDayStatus,
  getHabitInsight,
  getMonthDates,
} from '../utils/habitUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardSection = ({ goals, checkIns }) => {
  const [period, setPeriod] = useState('month');
  const periodDates = useMemo(() => getDatesForPeriod(period, new Date()), [period]);
  const habitStats = useMemo(() => goals.map((goal) => ({
    goal,
    stats: calculateHabitStats(goal, checkIns, periodDates),
  })), [checkIns, goals, periodDates]);

  const totalCompleted = habitStats.reduce((sum, item) => sum + item.stats.completedCount, 0);
  const totalScheduled = habitStats.reduce((sum, item) => sum + item.stats.scheduledCount, 0);
  const overallAccuracy = totalScheduled ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const currentStreak = Math.max(...habitStats.map((item) => item.stats.currentStreak), 0);
  const bestStreak = Math.max(...habitStats.map((item) => item.stats.longestStreak), 0);
  const { bestHabit, worstHabit } = getBestAndWorstHabits(goals, checkIns, periodDates);

  const progressData = {
    labels: periodDates.map((date) => date.toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Completion Rate (%)',
      data: periodDates.map((date) => {
        const dateKey = formatDateKey(date);
        const scheduledHabits = goals.filter((goal) => getHabitDayStatus(goal, checkIns, dateKey) !== 'not-scheduled');
        if (!scheduledHabits.length) {
          return 0;
        }
        const completedHabits = scheduledHabits.filter((goal) => checkIns[dateKey]?.[goal.id]).length;
        return Math.round((completedHabits / scheduledHabits.length) * 100);
      }),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      tension: 0.35,
      fill: true,
    }],
  };

  const performanceData = {
    labels: habitStats.map((item) => item.goal.name),
    datasets: [{
      label: 'Completion Rate (%)',
      data: habitStats.map((item) => item.stats.accuracy),
      backgroundColor: habitStats.map((item) => item.goal.color || '#6366f1'),
    }],
  };

  const monthlyTrendData = {
    labels: Array.from({ length: 4 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (3 - index));
      return date.toLocaleDateString('en', { month: 'short' });
    }),
    datasets: goals.slice(0, 4).map((goal) => ({
      label: goal.name,
      data: Array.from({ length: 4 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (3 - index));
        return calculateHabitStats(goal, checkIns, getMonthDates(date.getFullYear(), date.getMonth())).accuracy;
      }),
      borderColor: goal.color || '#6366f1',
      backgroundColor: `${goal.color || '#6366f1'}20`,
      tension: 0.3,
    })),
  };

  const heatmapDates = useMemo(() => getMonthDates(new Date().getFullYear(), new Date().getMonth()), []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((value) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`btn ${period === value ? 'btn-primary' : 'btn-outline'}`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-fire text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentStreak}</h3>
            <p className="text-gray-600">Current Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-percentage text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{overallAccuracy}%</h3>
            <p className="text-gray-600">Accuracy</p>
            <p className="text-xs text-gray-500 mt-1">{totalCompleted} / {totalScheduled} scheduled completions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-trophy text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{bestStreak}</h3>
            <p className="text-gray-600">Longest Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-list-check text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{goals.length}</h3>
            <p className="text-gray-600">Active Habits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          <div className="h-64">
            <Line data={progressData} options={chartOptions} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Completion %</h3>
          <div className="h-64">
            <Bar data={performanceData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <div className="h-64">
            <Line data={monthlyTrendData} options={{ ...chartOptions, plugins: { legend: { display: true } } }} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consistency Heatmap</h3>
          <div className="grid grid-cols-7 gap-2">
            {heatmapDates.map((date) => {
              const dateKey = formatDateKey(date);
              const scheduledHabits = goals.filter((goal) => getHabitDayStatus(goal, checkIns, dateKey) !== 'not-scheduled');
              const completedHabits = scheduledHabits.filter((goal) => checkIns[dateKey]?.[goal.id]).length;
              const ratio = scheduledHabits.length ? completedHabits / scheduledHabits.length : 0;
              const backgroundColor =
                ratio === 0 ? '#f3f4f6' :
                ratio < 0.34 ? '#bfdbfe' :
                ratio < 0.67 ? '#60a5fa' :
                '#1d4ed8';

              return (
                <div key={dateKey} className="text-center">
                  <div
                    className="rounded-lg"
                    style={{ backgroundColor, width: '100%', aspectRatio: '1 / 1' }}
                    title={`${dateKey}: ${completedHabits}/${scheduledHabits.length || 0}`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">{date.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Missed vs Completed Analysis</h3>
          <div className="divide-y divide-gray-100">
            {habitStats.map(({ goal, stats }) => {
              const goalProgress = goal.monthlyTarget ? Math.min(100, Math.round((stats.completedCount / goal.monthlyTarget) * 100)) : 0;
              const remaining = Math.max((goal.monthlyTarget || 0) - stats.completedCount, 0);
              return (
                <div key={goal.id} className="habit-item">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{goal.name}</div>
                    <div className="text-sm text-gray-500">You completed {goal.name} {stats.completedCount}/{stats.scheduledCount} days</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Completed {stats.completedCount}, missed {stats.missedCount}, current streak {stats.currentStreak}, longest streak {stats.longestStreak}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{stats.accuracy}%</div>
                    <div className="text-xs text-gray-500">Goal progress {goalProgress}%</div>
                    <div className="text-xs text-gray-500">{remaining} left to hit monthly goal</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Insights</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-sm font-semibold text-gray-700">Best performer</div>
              <div className="text-gray-900">{bestHabit ? `${bestHabit.habit.name} at ${bestHabit.stats.accuracy}%` : 'No scheduled data yet'}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-sm font-semibold text-gray-700">Needs attention</div>
              <div className="text-gray-900">{worstHabit ? `${worstHabit.habit.name} at ${worstHabit.stats.accuracy}%` : 'No scheduled data yet'}</div>
            </div>
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl bg-indigo-50 text-indigo-900">
                {getHabitInsight(goal, checkIns, periodDates)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
