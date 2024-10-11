const express = require("express");
const cookieparser = require('cookie-parser');
const path = require('path');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Import custom modules
const playermodle = require('./playermodle.js');

// Initialize express app
const app = express();
const PORT = 80;

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
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passward, salt);
    let data=playermodle.findOne();
    // Create new user in the database
    await playermodle.create({
      name,
      userEmail,
      passward: hash,
      score: 0,
      rank: data.length
    });

    // Generate the JWT token
    const token = jwt.sign({ userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token in the cookies
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    // Redirect to the home page
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
    const user = await playermodle.findOne({ userEmail });

    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(passward, user.passward);
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
    const user = await playermodle.findOne({ userEmail: req.user.userEmail });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});
app.get('/profileboard',isLoggedIn,(req,res)=>{
  res.render('profile');
});

// Update score route
app.post('/updatescore', authenticateToken, async (req, res) => {
  console.log('Reached /updatescore route');
  try {
    const { score } = req.body;
    console.log('Received score:', score);
    const userEmail = req.user.userEmail;
    console.log('User email:', userEmail);

    const updatedUser = await playermodle.findOneAndUpdate(
      { userEmail: userEmail },
      { $set: { score: score } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
    res.send(updatedUser);
    // res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).send('Server error');
  }
});

// Update rank route
app.post('/updaterank', authenticateToken, async (req, res) => {
  try {
    const { rank } = req.body;
    const userEmail = req.user.userEmail;

    const updatedUser = await playermodle.findOneAndUpdate(
      { userEmail: userEmail },
      { $set: { rank: rank } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ message: 'Rank updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).send('Server error');
  }
});

// API route to read user data
app.get('/read', async (req, res) => {
  try {
    const users = await playermodle.find();
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

// Start the server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
