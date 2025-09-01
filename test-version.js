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

// Try to get server info and version
const versionEndpoints = [
  '/api/v1/server/info',
  '/api/v2/server/info',
  '/api/server/info',
  '/server/info',
  '/info',
  '/api/v1/version',
  '/api/v2/version',
  '/api/version',
  '/version',
  '/api/v1/server',
  '/api/v2/server',
  '/api/server',
  '/server'
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
            // Not JSON
          }
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

async function testVersionEndpoints() {
  console.log('Testing version/info endpoints...\n');
  
  const results = [];
  for (const endpoint of versionEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.status === 200) {
      console.log('✓ Found working endpoint!');
      if (result.contentType && result.contentType.includes('application/json')) {
        console.log('JSON Response:', JSON.stringify(result.data, null, 2));
      } else {
        console.log('Response (first 200 chars):', result.data.substring(0, 200));
      }
      console.log('---');
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n=== Summary ===');
  const workingEndpoints = results.filter(r => r.status === 200);
  if (workingEndpoints.length > 0) {
    console.log('Working endpoints found:');
    workingEndpoints.forEach(ep => {
      console.log(`  ${ep.endpoint} (${ep.contentType})`);
    });
  } else {
    console.log('No working endpoints found');
  }
}

testVersionEndpoints().catch(console.error);