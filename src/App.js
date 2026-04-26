import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GoalsSection from './components/GoalsSection';
import DailySection from './components/DailySection';
import MonthlySection from './components/MonthlySection';
import DashboardSection from './components/DashboardSection';
import GoalModal from './components/GoalModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { normalizeHabit } from './utils/habitUtils';

const App = () => {
  const [currentSection, setCurrentSection] = useState('goals');
  const [goals, setGoals] = useLocalStorage('habitTrackerGoals', []);
  const [checkIns, setCheckIns] = useLocalStorage('habitTrackerCheckIns', {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const sections = [
    { id: 'goals', label: 'Goals', icon: 'fa-bullseye' },
    { id: 'daily', label: 'Daily', icon: 'fa-calendar-day' },
    { id: 'monthly', label: 'Monthly', icon: 'fa-calendar-alt' },
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
  ];

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goalData) => {
    const normalizedGoalData = normalizeHabit(goalData);

    if (editingGoal) {
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id ? { ...goal, ...normalizedGoalData } : goal
      ));
    } else {
      const newGoal = {
        ...normalizedGoalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId, skipConfirm = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to delete this habit?')) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      // Clean up check-ins for deleted goal
      setCheckIns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(date => {
          if (updated[date][goalId]) {
            delete updated[date][goalId];
          }
        });
        return updated;
      });
    }
  };

  const handleToggleHabit = (goalId, date) => {
    setCheckIns(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [goalId]: !prev[date]?.[goalId],
      },
    }));
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'goals':
        return (
          <GoalsSection
            goals={goals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'daily':
        return (
          <DailySection
            goals={goals}
            checkIns={checkIns}
            onToggleHabit={handleToggleHabit}
          />
        );
      case 'monthly':
        return (
          <MonthlySection
            goals={goals}
            checkIns={checkIns}
          />
        );
      case 'dashboard':
        return (
          <DashboardSection
            goals={goals}
            checkIns={checkIns}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar
        sections={sections}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderSection()}
      </main>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
        onDelete={(goalId) => handleDeleteGoal(goalId, true)}
      />
    </div>
  );
};

export default App;
