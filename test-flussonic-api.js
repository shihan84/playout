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

// Common Flussonic API endpoints to test
const endpoints = [
  '/api/server',
  '/api/v2/server',
  '/api/v1/server',
  '/server/api',
  '/api/status',
  '/api/v2/status',
  '/api/v1/status',
  '/api/streams',
  '/api/v2/streams',
  '/api/v1/streams',
  '/api/config',
  '/api/v2/config',
  '/api/v1/config',
  '/api/media',
  '/api/v2/media',
  '/api/v1/media',
  '/flussonic/api',
  '/erlyvideo/api',
  '/admin/api',
  '/cgi-bin/api'
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

    console.log(`Testing: https://${config.host}:${config.port}${endpoint}`);

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = null;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          // Not JSON, keep as string
        }

        resolve({
          endpoint,
          status: res.statusCode,
          message: res.statusMessage,
          contentType: res.headers['content-type'],
          data: parsedData || data
        });
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
    
    // Stop if we find a working endpoint
    if (result.status === 200) {
      console.log('✓ Found working endpoint!');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      break;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== Test Results ===');
  results.forEach(result => {
    console.log(`${result.endpoint}: ${result.status} - ${result.message}`);
    if (result.contentType) {
      console.log(`  Content-Type: ${result.contentType}`);
    }
  });
}

testAllEndpoints().catch(console.error);