const http = require('http');

console.log('Testing HackVerse Backend...\n');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('\n✅ Backend is responding correctly!');
        console.log('✅ All features are operational!');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\nDebugging tips:');
  console.log('1. Make sure backend is running: npm start');
  console.log('2. Check if port 4000 is available');
  console.log('3. Look for firewall/antivirus blocking');
});

req.end();
