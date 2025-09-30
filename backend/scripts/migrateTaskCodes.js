const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('../models/Task');

// Load environment variables
dotenv.config({ path: './.env' });

// Get MongoDB URI from environment or use default local connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';

// Function to generate task code
const generateTaskCode = async (currentNumber) => {
  return `T${(currentNumber + 1).toString().padStart(4, '0')}`;
};

const migrateTaskCodes = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all tasks sorted by creation date
    const tasks = await Task.find().sort({ createdAt: 1 });
    console.log(`Found ${tasks.length} tasks to update`);

    // Update each task with a unique task code
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskCode = await generateTaskCode(i);
      
      await Task.findByIdAndUpdate(
        task._id,
        { $set: { taskCode } },
        { new: true, runValidators: true }
      );
      
      console.log(`Updated task ${i + 1}/${tasks.length}: ${task._id} -> ${taskCode}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateTaskCodes();
