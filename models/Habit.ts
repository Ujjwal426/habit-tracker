import mongoose from 'mongoose'

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'other'],
    default: 'other',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'weekdays', 'weekends', 'mon-wed-fri', 'tue-thu', 'mon-sat', 'custom', 'monthly'],
    default: 'daily',
  },
  customDays: [{
    type: Number,
    min: 0,
    max: 6,
  }],
  target: {
    type: Number,
    default: 1,
    min: 1,
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const HabitCheckInSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema)
export const HabitCheckIn = mongoose.models.HabitCheckIn || mongoose.model('HabitCheckIn', HabitCheckInSchema)
