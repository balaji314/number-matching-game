const http = require('http');

// Test backend health endpoint
function testBackendHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Backend Health Check:', response);
          resolve(response);
        } catch (error) {
          console.log('❌ Backend Health Check - Invalid JSON:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Backend Health Check - Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Backend Health Check - Timeout');
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
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Game Status Check:', response);
          resolve(response);
        } catch (error) {
          console.log('❌ Game Status Check - Invalid JSON:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Game Status Check - Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Game Status Check - Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test CORS headers
function testCORS() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000'
      }
    };

    const req = http.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader && (corsHeader === '*' || corsHeader.includes('localhost:3000'))) {
        console.log('✅ CORS Headers:', res.headers);
        resolve(res.headers);
      } else {
        console.log('❌ CORS Headers missing or incorrect:', res.headers);
        reject(new Error('CORS not configured properly'));
      }
    });

    req.on('error', (error) => {
      console.log('❌ CORS Test - Connection failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Testing Backend Setup...\n');
  
  try {
    await testBackendHealth();
    await testGameStatus();
    await testCORS();
    
    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Backend is ready for frontend connection');
    
  } catch (error) {
    console.log('\n❌ Some backend tests failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm start');
    console.log('2. Check if port 3001 is available');
    console.log('3. Check console logs for errors');
    console.log('\nError:', error.message);
  }
}

runAllTests();
