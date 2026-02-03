const express = require("express");
const cookieparser = require('cookie-parser');
const path = require('path');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { createClient } = require('redis');
const http = require('http');
const WebSocket = require('ws');
const fetch = require('node-fetch');
require('dotenv').config();
const { connectToDatabase, getCollection, closeConnection } = require('./playermodle.js');

// Initialize express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const PORT = process.env.PORT;
// Middleware setup
const corsOptions = {
  origin: [
    'https://quize-app-qan3.onrender.com',
    'https://git-3wi2.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  exposedHeaders: ['token'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(cookieparser());

// View engine setup
app.set('views', path.join(__dirname, '../frontend/views'));
app.set('view engine', 'ejs');

// Redis client setup
let redisClient = null;

// Game rooms management
const gameRooms = new Map(); // gameId -> { players: Set, gameData: {}, questionIndex: 0, timer: null }

// connecting the redis 
async function makeRedisConnection(){
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', err => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));

    await redisClient.connect();
    console.log('Redis connection established successfully');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}
// Create (or Add) a Game
async function createGame(gameId, gameData) {
    try {
        const client = await makeRedisConnection();
        const key = `game:${gameId}`;

        // Flatten the object for Redis Hash storage
        // Redis Hashes store values as strings, so we convert numbers/booleans
        // crowd: -1 means unlimited players, positive number means max capacity
        await client.hSet(key, {
            questionAmount: gameData.questionAmount.toString(),
            locked: gameData.locked.toString(),
            maxCrowd: gameData.maxCrowd.toString(), // -1 for unlimited, positive for limit
            currentCrowd: '0', // Current number of players
            difficulty: gameData.difficulty,
            rated: gameData.rated.toString()
        });

        // Add this game's ID to our "directory" Set
        await client.sAdd('active_games', key);
        
        console.log(`Game ${gameId} created.`);
        return true;
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
}

// 2. HELPER: Add User to Queue (as per your comment)
async function addUserToQueue(userId) {
    try {
        const client = await makeRedisConnection();
        await client.rPush('user_queue', userId);
        console.log(`User ${userId} added to queue.`);
    } catch (error) {
        console.error('Error adding user to queue:', error);
        throw error;
    }
}

// 3. MAIN GOAL: Fetch all Game Info objects as an Array
async function getAllGames() {
    try {
        const client = await makeRedisConnection();
        // Step A: Get all the keys (IDs) from the Set
        const gameKeys = await client.sMembers('active_games');

        if (gameKeys.length === 0) return [];

        // Step B: Use a Transaction (Multi) to fetch all Hashes in parallel
        // This is much faster than awaiting them one by one in a loop
        const multi = client.multi();
        
        for (const key of gameKeys) {
            multi.hGetAll(key);
        }
        
        const gamesData = await multi.exec();

        // Step C: Reformat the data back into your desired structure
        // gamesData is an array of objects [ { questionAmount: '10', ... }, ... ]
        
        const formattedResult = gamesData.map((game, index) => {
            // Optional: Parse strings back to numbers/booleans if needed
            const maxCrowd = parseInt(game.maxCrowd);
            const currentCrowd = parseInt(game.currentCrowd);
            
            return {
                gameid: gameKeys[index].split(':')[1], // Extract ID from "game:101"
                questionAmount: parseInt(game.questionAmount),
                locked: game.locked === 'true',
                maxCrowd: maxCrowd, // -1 for unlimited
                currentCrowd: currentCrowd,
                isFull: maxCrowd !== -1 && currentCrowd >= maxCrowd, // Check if game is full
                difficulty: game.difficulty,
                rated: game.rated === 'true'
            };
        });

        return formattedResult;
    } catch (error) {
        console.error('Error fetching all games:', error);
        return [];
    }
}
// Authentication middleware
function authenticateToken(req, res, next) {
  // Check token is present in cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    // Verify the token and decode the user info (userId, username, userEmail)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).send('Invalid token.');
  }
}



// Routes

// Home route
app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    return res.redirect('/home');
  }
  res.render("index");
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

// Signup route
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Ranking table route
app.get("/ranktable", (req, res) => {
  res.render("ranktable");
});

// Authentication route to create a new user (signup)
app.post('/create', async (req, res) => {
  const { name, userEmail, passward } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passward, salt);
    
    const usersCollection = getCollection('users');
    const existingUsers = await usersCollection.countDocuments();

    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser = {
      userId,
      name,
      userEmail,
      password: hash,
      score: 0,
      logintime: new Date().toISOString(),
      rank: existingUsers + 1
    };
    await usersCollection.insertOne(newUser);

    // Store userId and username in JWT
    const token = jwt.sign({ userId, username: name, userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/home");
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// Authentication route for login
app.post('/login', async (req, res) => {
  try {
    const { userEmail, passward } = req.body;
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ userEmail });

    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(passward, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // If passwords match, sign JWT with userId and username
    const token = jwt.sign({ 
      userId: user.userId, 
      username: user.name, 
      userEmail: user.userEmail 
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect('/home');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Server error');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  res.cookie("token", "", { expires: new Date(0) }); // Clear the token
  res.redirect("/");
});
app.get('/profileboard',authenticateToken,(req,res)=>{
  res.render('profile');
})
/* Protected routes (accessible only when logged in) 
  the basic user info can be retrived by req.requirement(userId, userName etc what ever is in the jwt)
*/
// Home route
app.get('/home', authenticateToken, (req, res) => {
  res.render('mainindex');
});

// Dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.render('dashboard');
});

// Profile route (fetching user data)
app.get('/profile',authenticateToken, async (req, res) => {
  try {
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ userEmail: req.user.userEmail });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});
// Update score route
app.post('/updatescore', authenticateToken, async (req, res) => {
  console.log('Reached /updatescore route');
  try {
    const { score } = req.body;
    console.log('Received score:', score);
    const userEmail = req.user.userEmail;
    console.log('User email:', userEmail);

    const usersCollection = getCollection('users');
    
    // First, find the current user to get their existing score
    const currentUser = await usersCollection.findOne({ userEmail: userEmail });
    
    if (!currentUser) {
      return res.status(404).send('User not found');
    }
    
    // Calculate the new score as the maximum of the existing score and the new score
    const newScore = Math.max(currentUser.score || 0, score);
    
    // Update the user's score with the new maximum score
    const updatedUser = await usersCollection.findOneAndUpdate(
      { userEmail: userEmail },
      { $set: { score: newScore } },
      { returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      return res.status(404).send('User not found');
    }
    res.send(updatedUser.value);
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).send('Server error');
  }
});
// Database status check route
app.get('/database-status', async (req, res) => {
  try {
    const usersCollection = getCollection('users');
    // Perform a simple operation to check database connectivity
    await usersCollection.findOne({}, { projection: { _id: 1 } });
    res.status(200).json({ status: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'disconnected', error: error.message });
  }
});
app.get('/settings',authenticateToken,(req,res)=>{
  res.render('settings');
})
// Update password route
app.post('/updatepassword', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userEmail = req.user.userEmail;
    console.log('Authenticated user email:', userEmail);

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Fetch the collection and update the password
    const usersCollection = getCollection('users');
    const updatedUser = await usersCollection.findOneAndUpdate(
      { userEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },  // Case-insensitive email check
      { $set: { password: hashedPassword } },
      { returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forget password route (renders reset password page)
app.get('/resetpassword', (req, res) => {
  res.render('resetpassword');   
});

// Forget password POST route
app.post('/forgetpassword', async (req, res) => {
  try {
    const { userEmail, newPassword } = req.body;
    console.log('Received reset request for email:', userEmail);

    if (!userEmail || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const usersCollection = getCollection('users');

    // Find the user with case-insensitive email matching
    const user = await usersCollection.findOne({ userEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const updatedUser = await usersCollection.findOneAndUpdate(
      { userEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
      { $set: { password: hashedPassword } },
      { returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ message: 'Failed to update password' });
    }

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user exists route
app.post('/checkuser', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ userEmail: userEmail });

    if (user) {
      res.status(200).json({ exists: true, message: 'User found' });
    } else {
      res.status(200).json({ exists: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rank route
app.post('/updaterank', authenticateToken, async (req, res) => {
  try {
    const { rank } = req.body;
    const userEmail = req.user.userEmail;

    const usersCollection = getCollection('users');
    const updatedUser = await usersCollection.findOneAndUpdate(
      { userEmail: userEmail },
      { $set: { rank: rank } },
      { returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ message: 'Rank updated successfully', user: updatedUser.value });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).send('Server error');
  }
});

// API route to read user data
app.get('/read', async (req, res) => {
  try {
    const usersCollection = getCollection('users');
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// send the user to loby
app.get('/loby', authenticateToken, async(req,res)=>{
  res.render('loby/index');
})
app.post('/loby',authenticateToken,async(req,res)=>{
  try{
    // Get userId from the decoded JWT token
    const userId = req.user.userId;
    
    await makeRedisConnection();

    // Add the user id in redis queue
    await addUserToQueue(userId);
    
    // Fetch the game_info objects present in redis as array
    const response = await getAllGames();
    res.status(200).json(response);
  }catch(e){
    console.log("error is " + e);
    res.status(500).json({ error: "server error" });
  }
})

// Create game endpoint 
app.post('/createGame', authenticateToken, async(req, res) => {
  try {
    const { questionAmount, difficulty, rated, maxCrowd, category } = req.body;
    
    console.log('Creating game with params:', { questionAmount, difficulty, rated, maxCrowd, category });
    
    // Validate input
    if (!questionAmount || !difficulty || rated === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate maxCrowd: should be -1 (unlimited) or positive number
    const crowdLimit = maxCrowd === undefined ? -1 : parseInt(maxCrowd);
    if (crowdLimit !== -1 && (crowdLimit < 1 || isNaN(crowdLimit))) {
      return res.status(400).json({ error: 'Invalid crowd limit. Use -1 for unlimited or positive number.' });
    }

    // Generate unique game ID
    const gameId = Date.now().toString();
    console.log('Generated game ID:', gameId);
    
    // Fetch questions from OpenTDB API
    let triviaURL = `https://opentdb.com/api.php?amount=${questionAmount}&difficulty=${difficulty}`;
    if (category && category > 0) {
      triviaURL += `&category=${category}`;
    }

    console.log('Fetching questions from:', triviaURL);
    
    const triviaResponse = await fetch(triviaURL);
    const triviaData = await triviaResponse.json();
    
    console.log('Trivia API response code:', triviaData.response_code);
    console.log('Questions received:', triviaData.results ? triviaData.results.length : 0);
    
    if (triviaData.response_code !== 0 || !triviaData.results) {
      console.error('Failed to fetch questions. Response:', triviaData);
      return res.status(500).json({ error: 'Failed to fetch questions from trivia API' });
    }

    // Store questions in Redis
    const client = await makeRedisConnection();
    const questionsKey = `game:${gameId}:questions`;
    
    console.log('Storing questions in Redis with key:', questionsKey);
    
    // Store each question as a hash
    for (let i = 0; i < triviaData.results.length; i++) {
      const question = triviaData.results[i];
      await client.hSet(`${questionsKey}:${i}`, {
        question: question.question,
        correct_answer: question.correct_answer,
        incorrect_answers: JSON.stringify(question.incorrect_answers),
        category: question.category,
        difficulty: question.difficulty,
        type: question.type
      });
      console.log(`Stored question ${i} in Redis`);
    }
    
    // Store question count
    await client.set(`${questionsKey}:count`, triviaData.results.length.toString());
    console.log('Stored question count:', triviaData.results.length);
    
    const gameData = {
      questionAmount: parseInt(questionAmount),
      locked: false, // Creator can manually lock the game
      maxCrowd: crowdLimit, // -1 for unlimited, positive for max players
      difficulty: difficulty,
      rated: Boolean(rated)
    };

    await createGame(gameId, gameData);
    console.log('Game created successfully:', gameId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Game created successfully',
      gameId: gameId,
      game: gameData
    });
  } catch(e) {
    console.error("Error creating game:", e);
    res.status(500).json({ error: "Failed to create game: " + e.message });
  }
})
// fetch question from trivia
app.post('/fetchQuestions',authenticateToken,(req,res)=>{

})

app.post('/joinGame', authenticateToken, async(req, res) => {
  try {
    const { gameId } = req.body;
    
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    const client = await makeRedisConnection();
    const gameKey = `game:${gameId}`;
    
    // Check if game exists
    const gameExists = await client.exists(gameKey);
    if (!gameExists) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get game data
    const gameData = await client.hGetAll(gameKey);
    
    // Check if game is manually locked by creator
    if (gameData.locked === 'true') {
      return res.status(403).json({ error: 'Game is locked by creator' });
    }

    // Check crowd capacity
    const maxCrowd = parseInt(gameData.maxCrowd);
    const currentCrowd = parseInt(gameData.currentCrowd);
    
    // If maxCrowd is not -1 (unlimited), check if game is full
    if (maxCrowd !== -1 && currentCrowd >= maxCrowd) {
      return res.status(403).json({ error: 'Game is full. Cannot accept more players.' });
    }

    // Initialize room if it doesn't exist
    if (!gameRooms.has(gameId)) {
      gameRooms.set(gameId, {
        players: new Map(), // userId -> { ws, username, score }
        gameData: {
          questionAmount: parseInt(gameData.questionAmount),
          difficulty: gameData.difficulty,
          rated: gameData.rated === 'true',
          locked: gameData.locked === 'true',
          maxCrowd: maxCrowd
        },
        questionIndex: 0,
        timer: null,
        started: false
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Ready to join game',
      gameId,
      wsUrl: `/ws?gameId=${gameId}&token=${req.cookies.token}`
    });
  } catch(e) {
    console.log("Error joining game: " + e);
    res.status(500).json({ error: "Failed to join game" });
  }
})

// WebSocket connection handler
wss.on('connection', async (ws, req) => {
  console.log('WebSocket connection attempt');
  
  const params = new URLSearchParams(req.url.split('?')[1]);
  const gameId = params.get('gameId');

  console.log('GameId from URL:', gameId);

  if (!gameId) {
    console.log('Missing gameId, closing connection');
    ws.close(1008, 'Missing gameId');
    return;
  }

  try {
    // Extract token from cookie header
    const cookies = req.headers.cookie;
    console.log('Cookies received:', cookies);
    
    if (!cookies) {
      console.log('No cookies found, closing connection');
      ws.close(1008, 'No authentication cookie');
      return;
    }

    // Parse cookies to get token
    let token = null;
    const cookieArray = cookies.split(';');
    for (let cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        token = value;
        break;
      }
    }

    console.log('Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('Token not found in cookies, closing connection');
      ws.close(1008, 'Authentication token not found');
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, username } = decoded;
    
    console.log('User authenticated:', userId, username);

    const room = gameRooms.get(gameId);
    if (!room) {
      console.log('Game room not found:', gameId);
      ws.close(1008, 'Game room not found');
      return;
    }

    console.log('Room found, current players:', room.players.size);

    // Don't block players from joining after game starts
    // They just won't be able to answer questions that already passed
    // Removed the check: if (room.started) { ... }

    // Check crowd limit before adding player
    const client = await makeRedisConnection();
    const gameData = await client.hGetAll(`game:${gameId}`);
    const maxCrowd = parseInt(gameData.maxCrowd);
    const currentCrowd = room.players.size;

    console.log('Crowd check - Max:', maxCrowd, 'Current:', currentCrowd);

    if (maxCrowd !== -1 && currentCrowd >= maxCrowd) {
      console.log('Game is full, rejecting connection');
      ws.close(1008, 'Game is full');
      return;
    }

    // Add player to room
    room.players.set(userId, { ws, username, score: 0, answers: [] });
    console.log('Player added to room. Total players:', room.players.size);
    
    // Update current crowd count in Redis
    await client.hSet(`game:${gameId}`, 'currentCrowd', room.players.size.toString());

    // Broadcast player joined
    broadcastToRoom(gameId, {
      type: 'player_joined',
      userId,
      username,
      playerCount: room.players.size,
      maxCrowd: maxCrowd
    });

    // Send current game state to new player
    ws.send(JSON.stringify({
      type: 'game_state',
      players: Array.from(room.players.entries()).map(([id, p]) => ({
        userId: id,
        username: p.username,
        score: p.score
      })),
      gameData: room.gameData,
      started: room.started,
      maxCrowd: maxCrowd,
      currentCrowd: room.players.size
    }));

    console.log('Game state sent to player');

    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await handlePlayerMessage(gameId, userId, data);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    // Handle disconnect
    ws.on('close', async () => {
      console.log('Player disconnected:', userId);
      const room = gameRooms.get(gameId);
      if (room) {
        room.players.delete(userId);
        
        // Update current crowd count
        const client = await makeRedisConnection();
        await client.hSet(`game:${gameId}`, 'currentCrowd', room.players.size.toString());

        broadcastToRoom(gameId, {
          type: 'player_left',
          userId,
          username,
          playerCount: room.players.size
        });

        // Clean up empty rooms
        if (room.players.size === 0) {
          if (room.timer) clearTimeout(room.timer);
          gameRooms.delete(gameId);
          
          // Remove game from Redis
          await client.sRem('active_games', `game:${gameId}`);
          await client.del(`game:${gameId}`);
          console.log('Empty room cleaned up:', gameId);
        }
      }
    });

  } catch (err) {
    console.error('WebSocket auth error:', err);
    ws.close(1008, 'Authentication failed: ' + err.message);
  }
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  console.log('Upgrade request for path:', pathname);
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Broadcast message to all players in a room
function broadcastToRoom(gameId, message) {
  const room = gameRooms.get(gameId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  room.players.forEach((player) => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(messageStr);
    }
  });
}

// Handle player messages
async function handlePlayerMessage(gameId, userId, data) {
  const room = gameRooms.get(gameId);
  if (!room) return;

  switch (data.type) {
    case 'start_game':
      if (!room.started && room.players.size > 0) {
        room.started = true;
        console.log('Game started by user:', userId);
        
        // Note: Game is NOT locked when started, just no new players can join
        // The lock is only for manual locking by creator
        
        // Start sending questions
        await sendNextQuestion(gameId);
      }
      break;

    case 'answer':
      const player = room.players.get(userId);
      if (player && data.questionIndex === room.questionIndex) {
        // Validate answer server-side
        console.log(`Answer validation - Player answer: "${data.answer}", Correct answer: "${room.currentCorrectAnswer}"`);
        console.log(`Answer types - Player: ${typeof data.answer}, Correct: ${typeof room.currentCorrectAnswer}`);
        
        const correct = data.answer === room.currentCorrectAnswer;
        
        console.log(`Player ${userId} answered question ${data.questionIndex}: ${correct ? 'CORRECT' : 'WRONG'}`);
        
        player.answers[data.questionIndex] = {
          answer: data.answer,
          timeSpent: data.timeSpent,
          correct: correct
        };
        
        // Update score: +5 for correct, -1 for wrong
        const oldScore = player.score;
        if (correct) {
          player.score += 5;
          console.log(`Player ${userId} score: ${oldScore} + 5 = ${player.score}`);
        } else {
          player.score -= 1;
          console.log(`Player ${userId} score: ${oldScore} - 1 = ${player.score}`);
        }
        
        // Cache score in Redis (don't update DB yet)
        const client = await makeRedisConnection();
        await client.hSet(`game:${gameId}:scores`, userId, player.score.toString());

        // Broadcast updated scores immediately (real-time update)
        const currentScores = Array.from(room.players.entries())
          .map(([id, p]) => ({
            userId: id,
            username: p.username,
            score: p.score
          }))
          .sort((a, b) => b.score - a.score); // Sort by score descending

        console.log(`Broadcasting scores:`, currentScores);

        broadcastToRoom(gameId, {
          type: 'score_update',
          scores: currentScores
        });
      } else {
        console.log(`Answer rejected - Player: ${player ? 'found' : 'not found'}, QuestionIndex match: ${data.questionIndex === room.questionIndex}`);
      }
      break;
  }
}

// Send next question to all players
async function sendNextQuestion(gameId) {
  const room = gameRooms.get(gameId);
  if (!room) {
    console.error('sendNextQuestion: Room not found for gameId:', gameId);
    return;
  }

  console.log(`sendNextQuestion: GameId=${gameId}, QuestionIndex=${room.questionIndex}, TotalQuestions=${room.gameData.questionAmount}`);

  if (room.questionIndex >= room.gameData.questionAmount) {
    // Game over
    console.log('sendNextQuestion: All questions answered, ending game');
    await endGame(gameId);
    return;
  }

  try {
    // Fetch question from Redis
    const client = await makeRedisConnection();
    const questionKey = `game:${gameId}:questions:${room.questionIndex}`;
    
    console.log('sendNextQuestion: Fetching question from Redis key:', questionKey);
    
    const questionData = await client.hGetAll(questionKey);
    
    console.log('sendNextQuestion: Question data retrieved:', questionData);
    
    if (!questionData || !questionData.question) {
      console.error('sendNextQuestion: Question not found in Redis for key:', questionKey);
      
      // Check if questions exist at all
      const questionCount = await client.get(`game:${gameId}:questions:count`);
      console.error('sendNextQuestion: Question count in Redis:', questionCount);
      
      // List all keys for this game
      const allKeys = await client.keys(`game:${gameId}:*`);
      console.error('sendNextQuestion: All keys for this game:', allKeys);
      
      return;
    }

    // Parse incorrect answers
    const incorrectAnswers = JSON.parse(questionData.incorrect_answers);
    
    // Shuffle options (correct + incorrect)
    const allOptions = [questionData.correct_answer, ...incorrectAnswers];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    const question = {
      index: room.questionIndex,
      question: questionData.question,
      options: shuffledOptions,
      category: questionData.category,
      difficulty: questionData.difficulty,
      type: questionData.type
    };

    // Store correct answer in room (server-side only)
    room.currentCorrectAnswer = questionData.correct_answer;

    console.log('sendNextQuestion: Broadcasting question', room.questionIndex, 'to', room.players.size, 'players');

    broadcastToRoom(gameId, {
      type: 'question',
      question,
      timeLimit: 20
    });

    // Set timer for 20 seconds
    room.timer = setTimeout(async () => {
      console.log('sendNextQuestion: Timer expired for question', room.questionIndex);
      
      // Show leaderboard
      const leaderboard = Array.from(room.players.entries())
        .map(([id, p]) => ({
          userId: id,
          username: p.username,
          score: p.score
        }))
        .sort((a, b) => b.score - a.score);

      broadcastToRoom(gameId, {
        type: 'leaderboard',
        leaderboard,
        questionIndex: room.questionIndex,
        correctAnswer: room.currentCorrectAnswer
      });

      room.questionIndex++;

      // Wait 5 seconds before next question
      setTimeout(() => sendNextQuestion(gameId), 5000);
    }, 20000);
  } catch (error) {
    console.error('sendNextQuestion: Error:', error);
  }
}

// End game and update ratings
async function endGame(gameId) {
  const room = gameRooms.get(gameId);
  if (!room) return;

  console.log('Ending game:', gameId);

  const finalLeaderboard = Array.from(room.players.entries())
    .map(([id, p]) => ({
      userId: id,
      username: p.username,
      score: p.score
    }))
    .sort((a, b) => b.score - a.score);

  console.log('Final leaderboard:', finalLeaderboard);

  broadcastToRoom(gameId, {
    type: 'game_over',
    leaderboard: finalLeaderboard,
    rated: room.gameData.rated
  });

  // Update user scores in database ONLY if rated game
  if (room.gameData.rated) {
    console.log('Updating scores for rated game');
    const usersCollection = getCollection('users');
    
    for (const [userId, player] of room.players.entries()) {
      try {
        // Fetch cached score from Redis
        const client = await makeRedisConnection();
        const cachedScore = await client.hGet(`game:${gameId}:scores`, userId);
        const scoreToAdd = cachedScore ? parseInt(cachedScore) : player.score;
        
        console.log(`Updating score for user ${userId}: adding ${scoreToAdd} points`);
        
        // Get current user score
        const user = await usersCollection.findOne({ userId });
        const currentScore = user ? user.score : 0;
        const newTotalScore = currentScore + scoreToAdd;
        
        console.log(`User ${userId}: ${currentScore} + ${scoreToAdd} = ${newTotalScore}`);
        
        // Update user's total score in MongoDB (accumulated)
        await usersCollection.findOneAndUpdate(
          { userId },
          { $set: { score: newTotalScore } }
        );
        
        console.log(`Successfully updated score for user ${userId}`);
      } catch (error) {
        console.error(`Error updating score for user ${userId}:`, error);
      }
    }
  } else {
    console.log('Casual game - scores not saved to database');
  }

  // Clean up Redis data
  const client = await makeRedisConnection();
  
  // Delete questions
  const questionCount = await client.get(`game:${gameId}:questions:count`);
  if (questionCount) {
    for (let i = 0; i < parseInt(questionCount); i++) {
      await client.del(`game:${gameId}:questions:${i}`);
    }
    await client.del(`game:${gameId}:questions:count`);
  }
  
  // Delete cached scores
  await client.del(`game:${gameId}:scores`);
  
  // Delete game data
  await client.sRem('active_games', `game:${gameId}`);
  await client.del(`game:${gameId}`);
  
  console.log('Redis cleanup completed for game:', gameId);
  
  // Clean up room timer
  if (room.timer) clearTimeout(room.timer);
  
  // Close all connections after 10 seconds
  setTimeout(() => {
    console.log('Closing all connections for game:', gameId);
    room.players.forEach(player => player.ws.close());
    gameRooms.delete(gameId);
  }, 10000);
}

// Add this at the end of your route definitions
app.use((req, res, next) => {
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).send('Route not found');
});

// Connect to the database before starting the server
connectToDatabase().then(() => {
  // Start the server with WebSocket support
  server.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is ready`);
  });
}).catch(error => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});

// When your application is shutting down:
process.on('SIGINT', async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
  await closeConnection();
  process.exit(0);
});
