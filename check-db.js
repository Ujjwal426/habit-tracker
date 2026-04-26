const { MongoClient } = require('mongodb');

async function checkConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is required. Add it to .env.local before running this script.');
    process.exit(1);
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ MongoDB connected successfully!');
    
    const db = client.db();
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`, collections.map(c => c.name));
    
    await client.close();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkConnection();
