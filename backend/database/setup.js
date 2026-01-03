const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database tables...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log('✅ Database tables created successfully!');
    console.log('📊 Tables created:');
    console.log('   - students');
    console.log('   - companies');
    console.log('   - admins');
    console.log('   - jobs');
    console.log('   - applications');
    console.log('   - placement_drives');
    console.log('   - notifications');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await pool.end();
  }
};

// Run if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;