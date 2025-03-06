const { pool } = require('./db');

const migrateDb = async () => {
    try {
        // Add new columns to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'temporarypassword',
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        `);
        
        // Remove default password after migration
        await pool.query(`
            ALTER TABLE users 
            ALTER COLUMN password DROP DEFAULT;
        `);
        
        console.log('Database migration completed successfully');
    } catch (error) {
        console.error('Error during database migration:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
};

// Run the migration
migrateDb();
