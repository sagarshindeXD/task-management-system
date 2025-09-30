const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URI = 'mongodb://127.0.0.1:27017/task_management';

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    
    // List all databases
    const adminDb = conn.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));

    // List collections in the current database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach(coll => console.log(`- ${coll.name}`));

    // Count documents in tasks collection if it exists
    if (collections.some(c => c.name === 'tasks')) {
      const Task = require('../models/Task');
      const count = await Task.countDocuments();
      console.log(`\nFound ${count} tasks in the database`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
