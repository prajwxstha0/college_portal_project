const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Hash the password (using 'password' as default)
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Insert admin user
    await pool.query(
      `INSERT INTO admins (name, email, password) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING`,
      ['College Admin', 'admin@college.edu', hashedPassword]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: password');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    pool.end();
  }
};

createAdmin();