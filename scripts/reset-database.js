const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://almussanplanner12_db_user:Mplannorium%40020525@cluster0.laurh2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    console.log('Connected to MongoDB');

    // Collections to reset (add more as needed)
    const collectionsToReset = [
      'call_sessions',
      'messages',
      'notifications',
      'shifts',
      'appointments',
      'alerts'
    ];

    for (const collectionName of collectionsToReset) {
      try {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`✅ Reset ${collectionName}: ${result.deletedCount} documents deleted`);
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} not found or already empty`);
      }
    }

    console.log('🎉 Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetDatabase();