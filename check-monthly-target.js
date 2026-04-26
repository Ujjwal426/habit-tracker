const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Habit Schema (same as in your models/Habit.ts)
const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'other'], default: 'other' },
  frequency: { type: String, enum: ['daily', 'weekly', 'weekdays', 'weekends', 'mon-wed-fri', 'tue-thu', 'mon-sat', 'custom', 'monthly'], default: 'daily' },
  customDays: [{ type: Number, min: 0, max: 6 }],
  monthlyTarget: { type: Number, default: 1, min: 1, max: 31 },
  color: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);

async function checkAndFixMonthlyTarget() {
  try {
    console.log('Checking habits for monthlyTarget field...');
    
    // Find all habits
    const habits = await Habit.find({});
    console.log(`Found ${habits.length} habits`);
    
    let updatedCount = 0;
    
    for (const habit of habits) {
      console.log(`\nHabit: ${habit.name}`);
      console.log(`Has monthlyTarget: ${habit.monthlyTarget !== undefined}`);
      console.log(`monthlyTarget value: ${habit.monthlyTarget}`);
      
      // If monthlyTarget is undefined, update it
      if (habit.monthlyTarget === undefined) {
        console.log('Updating habit with monthlyTarget...');
        habit.monthlyTarget = 1;
        await habit.save();
        updatedCount++;
        console.log('Updated successfully');
      }
    }
    
    console.log(`\nSummary: Updated ${updatedCount} habits with monthlyTarget field`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAndFixMonthlyTarget();
