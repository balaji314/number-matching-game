const http = require('http');

console.log('🧪 Testing Backend Connection...\n');

// Test backend health endpoint
function testBackend() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Backend is running successfully!');
          console.log('📊 Response:', response);
          resolve(response);
        } catch (error) {
          console.log('❌ Invalid JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Backend connection failed:', error.message);
      console.log('💡 Make sure the backend is running on port 3001');
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Backend connection timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test game status endpoint
function testGameStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/game-status',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Game status endpoint working!');
          console.log('📊 Game Status:', response);
          resolve(response);
        } catch (error) {
          console.log('❌ Invalid JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Game status endpoint failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testBackend();
    await testGameStatus();
    
    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: cd frontend && npm start');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Test the game functionality');
    
  } catch (error) {
    console.log('\n❌ Backend tests failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend is running: cd backend && npm start');
    console.log('2. Check if port 3001 is available');
    console.log('3. Check backend logs for errors');
    console.log('\nError:', error.message);
  }
}

runTests();
