const mongoose = require('mongoose');

// Connect to MongoDB - replace with your actual connection string
mongoose.connect('mongodb://localhost:27017/habit-tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Habit Schema
const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'other' },
  frequency: { type: String, default: 'daily' },
  customDays: [{ type: Number, min: 0, max: 6 }],
  monthlyTarget: { type: Number, default: 1, min: 1, max: 31 },
  color: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);

async function checkHabits() {
  try {
    console.log('Checking habits in database...');
    
    // Find all habits
    const habits = await Habit.find({});
    console.log(`Found ${habits.length} habits`);
    
    for (const habit of habits) {
      console.log(`\n--- Habit: ${habit.name} ---`);
      console.log(`ID: ${habit._id}`);
      console.log(`Has monthlyTarget field: ${habit.monthlyTarget !== undefined}`);
      console.log(`monthlyTarget value: ${habit.monthlyTarget}`);
      console.log(`Full habit object:`, JSON.stringify(habit, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkHabits();
