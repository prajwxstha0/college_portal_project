 const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'college_portal',
  password: process.env.DB_PASSWORD || 'portal123',
  port: process.env.DB_PORT || 5432,
  // Optional: Add connection timeout
  connectionTimeoutMillis: 5000,
  // Optional: Add max connections
  max: 20,
  // Optional: Add idle timeout
  idleTimeoutMillis: 30000,
});

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected Successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    client.release();
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

// Event listeners for connection pool
pool.on('connect', () => {
  console.log('🔗 New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ PostgreSQL Pool Error:', err);
});

module.exports = {
  pool,
  testConnection
};
