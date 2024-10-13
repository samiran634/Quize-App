const express = require("../node_modules/express");
const cookieparser = require('../node_modules/cookie-parser');
const path = require('../node_modules/path');
const bcrypt = require("../node_modules/bcrypt");
const jwt = require("../node_modules/jsonwebtoken");
require('../node_modules/dotenv').config();

// Import custom modules
const { connectToDatabase, getCollection, closeConnection } = require('./playermodle.js');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(cookieparser());

// View engine setup
app.set('views', path.join(__dirname, '../frontend/views'));
app.set('view engine', 'ejs');

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;  // JWT stored in the cookie
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }
  try {
    // Verify the token and decode the user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Store the user data (e.g., id, email) in the request object
    next();
  } catch (err) {
    res.status(400).send('Invalid token.');
  }
}

// Middleware to check if a user is logged in
const isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

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
    
    const usersCollection = getCollection('users'); // Specify the collection name
    const existingUsers = await usersCollection.countDocuments();

    const newUser = {
      name,
      userEmail,
      password: hash,
      score: 0,
      logintime: new Date().toISOString(),
      rank: existingUsers + 1
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign({ userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

    // If passwords match, sign JWT and redirect
    const token = jwt.sign({ userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token);
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
app.get('/profileboard',isLoggedIn,(req,res)=>{
  res.render('profile');
})
// Protected routes (accessible only when logged in)

// Home route
app.get('/home', isLoggedIn, (req, res) => {
  res.render('mainindex');
});

// Dashboard route
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render('dashboard');
});

// Profile route (fetching user data)
app.get('/profile', isLoggedIn, async (req, res) => {
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
    const updatedUser = await usersCollection.findOneAndUpdate(
      { userEmail: userEmail },
      { $set: { score: score } },
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
app.get('/settings',isLoggedIn,(req,res)=>{
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
  res.render('resetpassword');  // Fixed typo in 'resetpassword'
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

// Add this at the end of your route definitions
app.use((req, res, next) => {
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).send('Route not found');
});

// Connect to the database before starting the server
connectToDatabase().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});

// When your application is shutting down:
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});
