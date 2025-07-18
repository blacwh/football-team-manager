const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing database connection...\n');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('📍 Connection String:', connectionString.replace(/:([^@]+)@/, ':****@')); // Hide password

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('\n⏳ Attempting to connect...');
    
    // Set connection timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    const connectPromise = client.connect();
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT version(), now() as current_time');
    console.log('✅ Database query successful!');
    console.log('📊 Database info:', result.rows[0]);
    
    await client.end();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Specific error handling
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 DNS Resolution failed - the hostname doesn\'t exist or can\'t be found');
      console.log('💡 This usually means:');
      console.log('   - Your Supabase project is paused/deleted');
      console.log('   - The connection string is outdated');
      console.log('   - Network/DNS issues');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Connection refused - server is not accepting connections');
      console.log('💡 This usually means the database server is down');
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.log('\n🔍 Connection timeout - server is unreachable');
      console.log('💡 This could be network/firewall issues');
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Check your Supabase dashboard');
    console.log('2. Verify project is active (not paused)');
    console.log('3. Get fresh connection string');
    console.log('4. Update .env.local file');
  }
}

testConnection();