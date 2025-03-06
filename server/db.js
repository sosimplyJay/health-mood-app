const { Pool } = require('pg');
require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Setup the PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false 
    //ssl:{
    //    rejectUnauthorized: false
    //}
});

// Function to initialize the database
const initDb = async () => {
    try {
        // Drop the table if it exists
        await pool.query(`DROP TABLE IF EXISTS users`);

        // MODIFIED: Added password field and is_verified field to users table
        // The password field will store hashed passwords for authentication
        // The is_verified field tracks whether the user has completed email verification
        await pool.query(`
           CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,        -- NEW: Stores hashed passwords
            verification_code VARCHAR(6) NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,     -- NEW: Tracks email verification status
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.log('Error initializing database:', error);
    }
};

module.exports = { pool, initDb };