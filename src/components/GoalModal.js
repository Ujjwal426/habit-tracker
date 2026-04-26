import React, { useEffect, useState } from "react";
import Select from "react-select";

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "custom", label: "Specific weekdays" },
  { value: "every-x-days", label: "Every X days" },
  { value: "monthly", label: "Once per month" },
];

const categoryOptions = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Learning" },
  { value: "productivity", label: "Productivity" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "other", label: "Other" },
];

const colorOptions = [
  { value: "#6366f1", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ec4899", label: "Pink" },
];

const dayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const defaultStartDate = new Date().toISOString().split("T")[0];

const GoalModal = ({ isOpen, onClose, goal, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: null,
    frequency: null,
    color: "#6366f1",
    customDays: [],
    monthlyTarget: 22,
    everyXDays: 2,
    monthlyDay: 1,
    startDate: defaultStartDate,
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || "",
        description: goal.description || "",
        category:
          categoryOptions.find((item) => item.value === goal.category) || null,
        frequency:
          frequencyOptions.find((item) => item.value === goal.frequency) ||
          null,
        color: goal.color || "#6366f1",
        customDays: goal.customDays
          ? dayOptions.filter((day) => goal.customDays.includes(day.value))
          : [],
        monthlyTarget: goal.monthlyTarget || 22,
        everyXDays: goal.everyXDays || 2,
        monthlyDay: goal.monthlyDay || 1,
        startDate: goal.startDate || defaultStartDate,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: null,
        frequency: null,
        color: "#6366f1",
        customDays: [],
        monthlyTarget: 22,
        everyXDays: 2,
        monthlyDay: 1,
        startDate: defaultStartDate,
      });
    }
  }, [goal]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name || !formData.category || !formData.frequency) {
      alert("Please fill in all required fields");
      return;
    }

    if (
      formData.frequency.value === "custom" &&
      formData.customDays.length === 0
    ) {
      alert("Please select at least one weekday for a custom schedule");
      return;
    }

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.value,
      frequency: formData.frequency.value,
      color: formData.color,
      customDays: formData.customDays.map((day) => day.value),
      monthlyTarget: Number(formData.monthlyTarget) || 0,
      everyXDays: Number(formData.everyXDays) || 2,
      monthlyDay: Number(formData.monthlyDay) || 1,
      startDate: formData.startDate,
    });
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e5e7eb",
      minHeight: "50px",
      "&:hover": { borderColor: "#6366f1" },
      boxShadow: "none",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#111827",
    }),
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <i className="fas fa-bullseye text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {goal ? "Edit Habit" : "Create New Habit"}
                </h2>
                <p className="text-sm text-black">
                  Set a clear schedule so the tracker can calculate accuracy
                  correctly.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-110px)]"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-tag text-indigo-500"></i>
              Habit Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              placeholder="Gym, Study, Football"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-align-left text-indigo-500"></i>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
              rows={3}
              placeholder="Optional notes about this habit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-folder text-indigo-500"></i>
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(category) => setFormData({ ...formData, category })}
                options={categoryOptions}
                styles={customStyles}
                placeholder="Select category..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-calendar text-indigo-500"></i>
                Frequency Pattern *
              </label>
              <Select
                value={formData.frequency}
                onChange={(frequency) =>
                  setFormData({ ...formData, frequency })
                }
                options={frequencyOptions}
                styles={customStyles}
                placeholder="Select frequency..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  frequency: frequencyOptions[0],
                  customDays: [],
                })
              }
              className="px-4 py-3 border border-gray-200 rounded-xl text-left hover:bg-gray-50"
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  frequency: frequencyOptions[1],
                  customDays: dayOptions.filter((day) =>
                    [1, 2, 3, 4, 5, 6].includes(day.value),
                  ),
                })
              }
              className="px-4 py-3 border border-gray-200 rounded-xl text-left hover:bg-gray-50"
            >
              Mon-Sat
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  frequency: frequencyOptions[1],
                  customDays: dayOptions.filter((day) =>
                    [0, 6].includes(day.value),
                  ),
                })
              }
              className="px-4 py-3 border border-gray-200 rounded-xl text-left hover:bg-gray-50"
            >
              Weekends
            </button>
          </div>

          {formData.frequency?.value === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-calendar-days text-indigo-500"></i>
                Select Weekly Days
              </label>
              <Select
                value={formData.customDays}
                onChange={(customDays) =>
                  setFormData({ ...formData, customDays: customDays || [] })
                }
                options={dayOptions}
                isMulti
                styles={customStyles}
                placeholder="Select days..."
              />
            </div>
          )}

          {formData.frequency?.value === "every-x-days" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <i className="fas fa-repeat text-indigo-500"></i>
                  Repeat Every
                </label>
                <input
                  type="number"
                  min="2"
                  value={formData.everyXDays}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      everyXDays: Number(event.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  Use 2 for alternate days
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <i className="fas fa-play text-indigo-500"></i>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(event) =>
                    setFormData({ ...formData, startDate: event.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {formData.frequency?.value === "monthly" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-indigo-500"></i>
                Day Of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.monthlyDay}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    monthlyDay: Number(event.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-chart-line text-indigo-500"></i>
                Monthly Goal
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.monthlyTarget}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    monthlyTarget: Number(event.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                Example: complete Gym 22 days this month
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fas fa-palette text-indigo-500"></i>
                Color Theme
              </label>
              <Select
                value={colorOptions.find(
                  (option) => option.value === formData.color,
                )}
                onChange={(option) =>
                  setFormData({
                    ...formData,
                    color: option?.value || "#6366f1",
                  })
                }
                options={colorOptions}
                styles={customStyles}
                placeholder="Select color..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-black rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {goal ? "Update Habit" : "Create Habit"}
              </button>
            </div>

            {goal && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this habit? This action cannot be undone.",
                    )
                  ) {
                    onDelete(goal.id);
                    onClose();
                  }
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium"
              >
                <i className="fas fa-trash-alt mr-2"></i>
                Delete Habit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
