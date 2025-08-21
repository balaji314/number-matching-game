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
      console.log('✅ CORS Check:', corsHeader ? 'CORS headers present' : 'No CORS headers');
      resolve(corsHeader);
    });

    req.on('error', (error) => {
      console.log('❌ CORS Check - Connection failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Backend and Frontend Setup...\n');

  try {
    await testBackendHealth();
    await testGameStatus();
    await testCORS();
    
    console.log('\n✅ All tests passed! Your setup is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: cd frontend && npm start');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Test the game functionality');
    
  } catch (error) {
    console.log('\n❌ Some tests failed. Please check:');
    console.log('1. Is the backend running? (cd backend && npm start)');
    console.log('2. Is port 3001 available?');
    console.log('3. Are all dependencies installed?');
    console.log('\nError:', error.message);
  }
}

// Run tests
runTests();
