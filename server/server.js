const express = require('express');
const path = require('path');
const { pool, initDb } = require('./db');
const sendEmail = require('./email'); // Import sendEmail function
require('dotenv').config();

const app = express();

app.use(express.json());

// Initialize database
initDb();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// API route for form submissions
app.post('/submit', async (req, res) => {
  const { name, email } = req.body;
  console.log(`Received request with name: ${name}, email: ${email}`);
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, verification_code) VALUES ($1, $2, $3) RETURNING *',
      [name, email, verificationCode]
    );

    // Send verification email
    subject= "Verify Email";
    content= "Your verification code: <b>${verificationCode}</b>";
    await sendEmail(email, subject, verificationCode);
    console.log("User added successfully:", result.rows[0]);
    res.json({ message: 'User added successfully. Verification email sent.', user: result.rows[0] });
  } catch (err) {
    console.error('Error saving user to database:', err);
    res.status(500).json({ error: 'Error saving user to database' });
  }
});

app.post('/verify', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
      const result = await pool.query(
          'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
          [email, verificationCode]
      );

      if (result.rows.length > 0) {
          res.json({ success: true, message: 'Email verified successfully!' });
      } else {
          res.status(400).json({ success: false, message: 'Invalid verification code.' });
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
  }
});

// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
