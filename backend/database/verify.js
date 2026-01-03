const { pool } = require('../config/database');

const verifyTables = async () => {
  try {
    console.log('🔍 Verifying database tables...');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    const tables = result.rows.map(row => row.table_name);
    
    console.log('✅ Found tables:');
    tables.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    // Check row counts for main tables
    console.log('\n📊 Table row counts:');
    
    const tableCounts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM admins'),
      pool.query('SELECT COUNT(*) FROM jobs')
    ]);
    
    console.log(`   - students: ${tableCounts[0].rows[0].count} rows`);
    console.log(`   - companies: ${tableCounts[1].rows[0].count} rows`);
    console.log(`   - admins: ${tableCounts[2].rows[0].count} rows`);
    console.log(`   - jobs: ${tableCounts[3].rows[0].count} rows`);
    
    console.log('\n🎉 Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
};

verifyTables();