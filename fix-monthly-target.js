// This script will fix existing habits to have monthlyTarget field
const { MongoClient } = require('mongodb');

async function fixMonthlyTarget() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('habit-tracker');
    const habitsCollection = db.collection('habits');
    
    // Find all habits that don't have monthlyTarget field
    const habitsWithoutMonthlyTarget = await habitsCollection.find({ 
      monthlyTarget: { $exists: false } 
    }).toArray();
    
    console.log(`Found ${habitsWithoutMonthlyTarget.length} habits without monthlyTarget`);
    
    // Update each habit to add monthlyTarget field
    for (const habit of habitsWithoutMonthlyTarget) {
      console.log(`Updating habit: ${habit.name}`);
      await habitsCollection.updateOne(
        { _id: habit._id },
        { $set: { monthlyTarget: 1 } }
      );
    }
    
    // Check all habits now
    const allHabits = await habitsCollection.find({}).toArray();
    console.log('\nAll habits in database:');
    allHabits.forEach(habit => {
      console.log(`- ${habit.name}: monthlyTarget = ${habit.monthlyTarget}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixMonthlyTarget();
