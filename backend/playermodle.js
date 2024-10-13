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

    // Ensure the 'users' collection exists with schema validation
    await database.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "userEmail", "password", "score", "logintime", "rank"],
          properties: {
            name: { bsonType: "string" },
            userEmail: { bsonType: "string" },
            password: { bsonType: "string" },
            score: { bsonType: "number" },
            logintime: { bsonType: "string" },
            rank: { bsonType: "number" }
          }
        }
      }
    });

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
