const http = require('http');
const { exec } = require('child_process');

console.log('🧪 Testing Complete Setup...\n');

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

// Test frontend (basic connectivity)
function testFrontend() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Frontend is accessible!');
      console.log('📊 Status Code:', res.statusCode);
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log('❌ Frontend connection failed:', error.message);
      console.log('💡 Make sure the frontend is running on port 3000');
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Frontend connection timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Check if ports are in use
function checkPorts() {
  return new Promise((resolve) => {
    exec('netstat -an | findstr :3000', (error, stdout) => {
      const port3000 = stdout.includes('LISTENING');
      exec('netstat -an | findstr :3001', (error2, stdout2) => {
        const port3001 = stdout2.includes('LISTENING');
        
        console.log('🔍 Port Status:');
        console.log(`   Port 3000 (Frontend): ${port3000 ? '✅ In Use' : '❌ Not in Use'}`);
        console.log(`   Port 3001 (Backend): ${port3001 ? '✅ In Use' : '❌ Not in Use'}`);
        
        resolve({ port3000, port3001 });
      });
    });
  });
}

// Run all tests
async function runAllTests() {
  try {
    console.log('🔍 Checking port availability...\n');
    await checkPorts();
    
    console.log('\n🧪 Testing Backend...\n');
    await testBackend();
    await testGameStatus();
    
    console.log('\n🧪 Testing Frontend...\n');
    await testFrontend();
    
    console.log('\n🎉 All tests passed! Your setup is working correctly.');
    console.log('\n📋 Access Points:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend Health: http://localhost:3001/health');
    console.log('   Game Status: http://localhost:3001/api/game-status');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Create a room and test the game');
    console.log('3. Invite friends to join your room');
    
  } catch (error) {
    console.log('\n❌ Some tests failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Backend: cd backend && npm start');
    console.log('2. Frontend: cd frontend && npm start');
    console.log('3. Check if ports 3000 and 3001 are available');
    console.log('4. Check console logs for errors');
    console.log('\nError:', error.message);
  }
}

runAllTests();
