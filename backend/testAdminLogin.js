const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

const testAdminLogin = async () => {
  try {
    console.log('🔍 Testing admin login...');
    
    // Check if admin exists
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      ['admin@college.edu']
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ No admin found with email: admin@college.edu');
      
      // Create admin if doesn't exist
      const hashedPassword = await bcrypt.hash('password', 10);
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
        ['College Admin', 'admin@college.edu', hashedPassword]
      );
      console.log('✅ Admin created successfully!');
    } else {
      console.log('✅ Admin found:', adminResult.rows[0]);
      
      // Test password verification
      const admin = adminResult.rows[0];
      const isPasswordValid = await bcrypt.compare('password', admin.password);
      console.log('🔐 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    pool.end();
  }
};

testAdminLogin();