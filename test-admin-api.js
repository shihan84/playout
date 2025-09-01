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

// Test different admin API endpoints and methods
const tests = [
  { method: 'GET', path: '/admin/api' },
  { method: 'POST', path: '/admin/api' },
  { method: 'GET', path: '/admin/api/server' },
  { method: 'GET', path: '/admin/api/streams' },
  { method: 'GET', path: '/admin/api/config' },
  { method: 'GET', path: '/admin/api/status' },
  { method: 'GET', path: '/admin/api/v1' },
  { method: 'GET', path: '/admin/api/v2' },
  { method: 'GET', path: '/admin/api/flussonic' },
  { method: 'GET', path: '/admin' },
  { method: 'GET', path: '/admin/' },
  { method: 'POST', path: '/admin/' },
  { method: 'GET', path: '/streamer/api' },
  { method: 'GET', path: '/streamer/api/v1' },
  { method: 'GET', path: '/streamer/api/v2' }
];

function testApiCall(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: test.path,
      method: test.method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Flussonic-Test/1.0'
      },
      timeout: 10000
    };

    console.log(`Testing: ${test.method} https://${config.host}:${config.port}${test.path}`);

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`Content-Type: ${res.headers['content-type'] || 'unknown'}`);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = null;
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            console.log('Failed to parse JSON response');
          }
        }

        resolve({
          method: test.method,
          path: test.path,
          status: res.statusCode,
          message: res.statusMessage,
          contentType: res.headers['content-type'],
          data: parsedData || data.substring(0, 500) + (data.length > 500 ? '...' : '')
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        method: test.method,
        path: test.path,
        status: 'ERROR',
        message: error.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        method: test.method,
        path: test.path,
        status: 'TIMEOUT',
        message: 'Request timed out',
        data: null
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing admin API endpoints...\n');
  
  const results = [];
  for (const test of tests) {
    const result = await testApiCall(test);
    results.push(result);
    
    if (result.status === 200 && result.contentType && result.contentType.includes('application/json')) {
      console.log('✓ Found JSON API endpoint!');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      break;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== Test Results ===');
  results.forEach(result => {
    console.log(`${result.method} ${result.path}: ${result.status} - ${result.message}`);
    if (result.contentType) {
      console.log(`  Content-Type: ${result.contentType}`);
    }
  });
}

runTests().catch(console.error);