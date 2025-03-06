const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); // NEW: Import bcrypt for password hashing
const { pool, initDb } = require('./db');
const sendEmail = require('./email');
require('dotenv').config();

const app = express();

app.use(express.json());

// Initialize database
initDb();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// ========================================================
// Authentication Routes
// ========================================================

// NEW: Registration endpoint (replaces the old /submit endpoint)
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // NEW: Added password to request body
  console.log(`Received registration request with name: ${name}, email: ${email}`);
  
  // Email validation
  const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Email must end with @spelman.edu or @morehouse.edu.' 
    });
  }
  
  // NEW: Password validation
  if (!password || password.length < 8) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 8 characters long.'
    });
  }

  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // NEW: Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // MODIFIED: Added password to database insert
    const result = await pool.query(
      'INSERT INTO users (name, email, verification_code, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, verificationCode, hashedPassword]
    );

    // Send verification email
    const subject = "Verify Your Email";
    const content = `Your verification code: <b>${verificationCode}</b>`;
    await sendEmail(email, subject, content);
    
    console.log("User registered successfully:", result.rows[0]);
    res.json({ 
      success: true,
      message: 'Registration successful. Verification email sent.'
    });
  } catch (err) {
    console.error('Error during registration:', err);
    
    // Handle duplicate email
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error saving user to database'
    });
  }
});

// NEW: Login endpoint for returning users
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Received login request for email: ${email}`);

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // User not found
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = userResult.rows[0];
    
    // NEW: Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({ 
        success: false,
        message: 'Email not verified. Please verify your email first.' 
      });
    }
    
    // NEW: Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Login successful
    res.json({
      success: true,
      message: 'Login successful',
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// MODIFIED: Enhanced verification endpoint to update verification status
app.post('/verify', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Check if verification code is valid
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
      [email, verificationCode]
    );

    if (result.rows.length > 0) {
      // NEW: Update the user's verification status
      await pool.query(
        'UPDATE users SET is_verified = TRUE WHERE email = $1',
        [email]
      );
      
      res.json({ 
        success: true, 
        message: 'Email verified successfully!',
        name: result.rows[0].name,
        email: result.rows[0].email
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code.' 
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database error during verification' 
    });
  }
});

// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});