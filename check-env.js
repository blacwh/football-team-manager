// Check if environment variables are loading correctly
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...\n');

if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL found!');
  console.log('📍 Value:', process.env.DATABASE_URL);
  
  // Parse the URL to show components
  const url = process.env.DATABASE_URL;
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (match) {
    console.log('\n📊 Connection Details:');
    console.log('  User:', match[1]);
    console.log('  Password:', '*'.repeat(match[2].length));
    console.log('  Host:', match[3]);
    console.log('  Port:', match[4]);
    console.log('  Database:', match[5]);
  }
} else {
  console.log('❌ DATABASE_URL not found!');
  console.log('🔍 Available environment variables:');
  Object.keys(process.env)
    .filter(key => key.includes('DATABASE') || key.startsWith('NEXT_'))
    .forEach(key => console.log(`  ${key}:`, process.env[key]));
}

console.log('\n📁 Current directory:', process.cwd());
console.log('📄 Looking for .env.local file...');

const fs = require('fs');
const path = require('path');

const envFiles = ['.env.local', '.env', '.env.development.local'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`   Contains ${lines.length} environment variables`);
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});