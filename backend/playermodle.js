const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // Make sure this is set in your .env file
const client = new MongoClient(uri);

let usersCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db("playermodel");  
    usersCollection = database.collection("users");

    // Create a schema validator for the users collection
    await database.command({
      collMod: "users",
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

    console.log("Connected to the database and user schema created successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  getCollection: () => usersCollection,
  closeConnection: () => client.close()
};
