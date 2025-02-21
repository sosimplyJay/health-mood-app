const { Pool } = require('pg');
require("dotenv").config();
console.log("DATABASE_URL:",process.env.DATABASE_URL)
// Setup the PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false 
    //ssl:{
        //rejectUnauthorized: false
    //}
});

// Function to initialize the database
const initDb = async () => {
    try {
        await pool.query(`
           CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            verification_code VARCHAR(6) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.log('Error initializing database:', error);
    }
};

module.exports = { pool, initDb };