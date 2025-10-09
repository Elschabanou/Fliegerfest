const mongoose = require('mongoose');

// MongoDB URI direkt setzen (aus .env.local)
const MONGODB_URI = 'mongodb://localhost:27017/fliegerevents';

// Alternative: MongoDB Atlas URI (falls Sie eine haben)
// const MONGODB_URI = 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fliegerevents?retryWrites=true&w=majority';

console.log('MONGODB_URI:', MONGODB_URI);

async function debugDatabase() {
  try {
    console.log('Verbinde mit MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB verbunden');

    const db = mongoose.connection.db;
    console.log('Datenbank Name:', db.databaseName);

    // Liste alle Collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Prüfe Events Collection
    const eventsCollection = db.collection('events');
    const eventCount = await eventsCollection.countDocuments();
    console.log('Anzahl Events:', eventCount);

    if (eventCount > 0) {
      const sampleEvent = await eventsCollection.findOne();
      console.log('Beispiel Event:', JSON.stringify(sampleEvent, null, 2));
    }

    // Prüfe mit Mongoose Model
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }), 'events');
    const mongooseEvents = await Event.find().limit(3);
    console.log('Mongoose Events:', mongooseEvents.length);
    if (mongooseEvents.length > 0) {
      console.log('Erstes Mongoose Event:', JSON.stringify(mongooseEvents[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Verbindung geschlossen');
  }
}

debugDatabase();
