const https = require('https');

// Test configuration
const config = {
  host: 'cdn.itassist.one',
  port: 443,
  username: 'admin',
  password: 'ad@min1991'
};

// Create basic auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

const endpoints = [
  '/api/v1/server/status',
  '/api/v1/status',
  '/server/api/status',
  '/flussonic/api/status',
  '/api/server/status',
  '/status',
  '/',
  '/api/v1/streams',
  '/api/v1/config'
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Flussonic-Test/1.0'
      },
      timeout: 10000
    };

    console.log(`\nTesting: https://${config.host}:${config.port}${endpoint}`);

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            endpoint,
            status: res.statusCode,
            message: res.statusMessage,
            data: jsonData
          });
        } catch (e) {
          resolve({
            endpoint,
            status: res.statusCode,
            message: res.statusMessage,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        status: 'ERROR',
        message: error.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint,
        status: 'TIMEOUT',
        message: 'Request timed out',
        data: null
      });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing Flussonic API endpoints...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.status === 200 || result.status === 'ERROR') {
      console.log('✓ Found working endpoint or error');
      break;
    }
  }
  
  console.log('\n=== Test Results ===');
  results.forEach(result => {
    console.log(`${result.endpoint}: ${result.status} - ${result.message}`);
    if (result.data && typeof result.data === 'object') {
      console.log('  Data keys:', Object.keys(result.data));
    }
  });
}

testAllEndpoints().catch(console.error);