require('../node_modules/dotenv').config();
const { MongoClient } = require('../node_modules/mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { connectTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 });

let usersCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db("playermodel");
    usersCollection = database.collection("users");

    // Check if 'users' collection exists
    const collections = await database.listCollections({ name: 'users' }).toArray();

    const validatorRules = {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "name", "userEmail", "password", "score", "logintime", "rank"],
        properties: {
          userId: { bsonType: "string" },
          userImage: { bsonType: "string" },
          about: { bsonType: "string" },
          tags: { bsonType: "array" },
          name: { bsonType: "string" },
          userEmail: { bsonType: "string" },
          password: { bsonType: "string" },
          score: { bsonType: "number" },
          logintime: { bsonType: "string" },
          rank: { bsonType: "number" }
        }
      }
    };

    if (collections.length === 0) {
      // Create collection if it doesn't exist
      await database.createCollection('users', { validator: validatorRules });
      console.log("Created 'users' collection with schema validation");
    } else {
      // Update schema validation if collection already exists
      await database.command({ collMod: 'users', validator: validatorRules });
      console.log("Updated 'users' collection schema validation");
    }

    console.log("Connected to database and schema set up successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    throw error;
  }
}

// Close connection on app termination
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  getCollection: () => usersCollection,
  closeConnection: () => client.close()
};
